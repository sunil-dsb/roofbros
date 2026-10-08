import { eq, and, ilike, sql, count } from 'drizzle-orm';
import { db } from '../../config/db.ts';
import { job } from '../../db/schema/job.schema.ts';
import { quote } from '../../db/schema/quote.schema.ts';
import {
  tileType,
  tileProfile,
  tileProfileColor,
} from '../../db/schema/tile.schema.ts';
import { z } from 'zod';
import { createJobSchema } from '../../shared/validations/job.validation.ts';
import { calculateBillOfMaterials } from '../../shared/utils/calculateMaterial.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import httpStatus from 'http-status';
export type CreateJobPayload = z.infer<typeof createJobSchema>;
export const createJobService = async (
  payload: z.infer<typeof createJobSchema>,
  userId: string,
) => {
  const {
    jobType,
    address,
    area_sq_mt,
    roofImage,
    dropzonePhotos,
    confidence,
    tileTypeId,
    tileProfileId,
    tileColorId,
    pitch,
    jobStatus,
    tilesize,
    topCoatBuckets,
    primer,
    primerType,
    totalTiles,
  } = payload;

  let typeExists;
  if (tileTypeId) {
    typeExists = await db.query.tileType.findFirst({
      where: eq(tileType.id, tileTypeId),
    });
    if (!typeExists) {
      throw new ApiError('Invalid tile type provided.', httpStatus.BAD_REQUEST);
    }
  }

  let profile;
  if (tileProfileId) {
    profile = await db.query.tileProfile.findFirst({
      where: eq(tileProfile.id, tileProfileId),
    });

    if (!profile) {
      throw new ApiError('Invalid tile profile.', httpStatus.BAD_REQUEST);
    }

    if (tileColorId) {
      const profileColor = await db
        .select()
        .from(tileProfileColor)
        .where(
          and(
            eq(tileProfileColor.profileId, tileProfileId),
            eq(tileProfileColor.colorId, tileColorId),
          ),
        )
        .limit(1);

      if (!profileColor.length) {
        throw new ApiError(
          'Invalid tile color for the selected profile.',
          httpStatus.BAD_REQUEST,
        );
      }
    }

    if (profile.profileType === 'restore' && jobType !== 'roof restoration') {
      throw new ApiError(
        'Validation Error: Restore profile types and their colors can only be used when creating a roof restoration job.',
        httpStatus.BAD_REQUEST,
      );
    }
  }

  let materials: ReturnType<typeof calculateBillOfMaterials> = {};
  if (area_sq_mt) {
    materials = calculateBillOfMaterials(
      area_sq_mt,
      typeExists?.name || '',
      jobType || '',
      profile?.name || '',
    );
  }

  if (topCoatBuckets !== undefined) materials.topCoatBuckets = topCoatBuckets;
  if (primer !== undefined) materials.primer = primer;
  if (primerType !== undefined) materials.primerType = primerType;
  if (totalTiles !== undefined) materials.totalTiles = totalTiles;

  return await db.transaction(async (tx) => {
    // 1. Insert the Job
    const [newJob] = await tx
      .insert(job)
      .values({
        address,
        area_sq_mt: area_sq_mt ? area_sq_mt.toString() : null,
        roofImage: roofImage || null,
        dropzonePhotos: (Array.isArray(dropzonePhotos)
          ? dropzonePhotos
          : dropzonePhotos
            ? [dropzonePhotos]
            : []
        ).map((url) => ({ url, createdAt: new Date().toISOString() })),
        userId,
        confidence: confidence ? confidence.toString() : null,
        pitch: pitch ? pitch.toString() : null,
        tilesize: tilesize ? tilesize.toString() : null,
        jobStatus: jobStatus || 'quoted',
        quoteCount: 1,
        topCoatBuckets: materials.topCoatBuckets || null,
        primer: materials.primer || null,
        primerType: materials.primerType || null,
        totalTiles: materials.totalTiles || null,
      })
      .returning();

    if (!newJob) {
      throw new ApiError(
        'Failed to create job',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 2. Create the Quote
    const seqResult = await tx.execute(sql`SELECT nextval('quote_seq')`);
    const seqRow = seqResult.rows[0];
    if (!seqRow)
      throw new ApiError(
        'Failed to fetch quote sequence number',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    const quoteNumber = `Q-${seqRow.nextval}`;
    const [newQuote] = await tx
      .insert(quote)
      .values({
        jobId: newJob.id,
        quoteNumber,
        area_sq_mt: area_sq_mt ? area_sq_mt.toString() : null,
        jobType,
        tileTypeId,
        tileProfileId,
        tileColorId,
        topCoatBuckets: materials.topCoatBuckets || null,
        primer: materials.primer || null,
        primerType: materials.primerType || null,
        totalTiles: materials.totalTiles || null,
      })
      .returning();

    if (!newQuote) {
      throw new ApiError(
        'Failed to create quote',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 3. Update Job with activeQuoteId
    const [updatedJob] = await tx
      .update(job)
      .set({ activeQuoteId: newQuote.id })
      .where(eq(job.id, newJob.id))
      .returning();

    if (!updatedJob) {
      throw new ApiError(
        'Failed to update job',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const fullyPopulatedQuote = await tx.query.quote.findFirst({
      where: eq(quote.id, newQuote.id),
      with: {
        tileType: true,
        tileProfile: true,
        tileColor: true,
      },
    });

    return {
      ...updatedJob,
      activeQuote: fullyPopulatedQuote,
      ...materials,
    };
  });
};

export const getJobsService = async (
  userId: string,
  status?: 'quoted' | 'requested' | 'delivered',
  jobId?: string,
  search?: string,
  page: number = 1,
  limit: number = 10,
) => {
  const filters = [eq(job.userId, userId)];

  if (status) {
    filters.push(eq(job.jobStatus, status));
  }
  if (jobId) {
    filters.push(eq(job.id, jobId));
  }
  if (search) {
    filters.push(ilike(job.address, `%${search}%`));
  }

  const offset = (page - 1) * limit;

  const [totalCountResult] = await db
    .select({ count: count() })
    .from(job)
    .where(filters.length > 0 ? and(...filters) : undefined);

  const totalCount = totalCountResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const jobs = await db.query.job.findMany({
    where: filters.length > 0 ? and(...filters) : undefined,
    limit,
    offset,
    columns: {
      id: true,
      userId: true,
      jobStatus: true,
      quoteCount: true,
      activeQuoteId: true,
      address: true,
      roofImage: true,
    },
    with: {
      activeQuote: {
        columns: {
          id: true,
          quoteNumber: true,
          tileColorId: true,
          tileProfileId: true,
          tileTypeId: true,
        },
        with: {
          tileType: true,
          tileProfile: true,
          tileColor: true,
        },
      },
      delivery: true,
    },
  });

  // Inject profile-specific color images
  for (const j of jobs) {
    const activeQuote = j.activeQuote;
    if (
      activeQuote &&
      activeQuote.tileProfileId &&
      activeQuote.tileColorId &&
      activeQuote.tileColor
    ) {
      const [profileColor] = await db
        .select({ imageUrl: tileProfileColor.imageUrl })
        .from(tileProfileColor)
        .where(
          and(
            eq(tileProfileColor.profileId, activeQuote.tileProfileId),
            eq(tileProfileColor.colorId, activeQuote.tileColorId),
          ),
        );
      if (profileColor && profileColor.imageUrl) {
        activeQuote.tileColor.imageUrl = profileColor.imageUrl;
      }
    }

    // Clean up redundant IDs
    const currentJob = j as Record<string, unknown>;
    delete currentJob.activeQuoteId;
    if (
      currentJob.jobStatus === 'requested' ||
      currentJob.jobStatus === 'delivered'
    ) {
      delete currentJob.quoteCount;
      // Extract requestedAt
      const deliveryObj = currentJob.delivery as
        Record<string, unknown> | undefined | null;
      if (deliveryObj) {
        currentJob.requestedAt = deliveryObj.requestedAt;
      }
    }
    delete currentJob.delivery;

    if (activeQuote) {
      const aq = activeQuote as Record<string, unknown>;
      delete aq.tileColorId;
      delete aq.tileProfileId;
      delete aq.tileTypeId;
    }
  }

  return {
    jobs,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
    },
  };
};

export const updateJobRoofImageService = async (
  id: string,
  imageUrl: string,
) => {
  const [updatedJob] = await db
    .update(job)
    .set({ roofImage: imageUrl })
    .where(eq(job.id, id))
    .returning();

  return updatedJob;
};

export const getJobByIdService = async (
  userId: string,
  id: string,
  search?: string,
) => {
  const filters = [eq(job.id, id), eq(job.userId, userId)];
  if (search) {
    filters.push(ilike(job.address, `%${search}%`));
  }

  const jobResult = await db.query.job.findFirst({
    where: and(...filters),
    with: {
      activeQuote: {
        columns: {
          id: true,
          jobId: true,
          quoteNumber: true,
          tileColorId: true,
          tileProfileId: true,
          tileTypeId: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          tileType: true,
          tileProfile: true,
          tileColor: true,
        },
      },
      quotes: {
        orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
        columns: {
          id: true,
          jobId: true,
          quoteNumber: true,
          tileColorId: true,
          tileProfileId: true,
          tileTypeId: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          tileType: true,
          tileProfile: true,
          tileColor: true,
        },
      },
      delivery: true,
    },
  });

  if (!jobResult) return null;

  if (
    jobResult.activeQuote &&
    jobResult.activeQuote.tileProfileId &&
    jobResult.activeQuote.tileColorId &&
    jobResult.activeQuote.tileColor
  ) {
    const [profileColor] = await db
      .select({ imageUrl: tileProfileColor.imageUrl })
      .from(tileProfileColor)
      .where(
        and(
          eq(tileProfileColor.profileId, jobResult.activeQuote.tileProfileId),
          eq(tileProfileColor.colorId, jobResult.activeQuote.tileColorId),
        ),
      );
    if (profileColor && profileColor.imageUrl) {
      jobResult.activeQuote.tileColor.imageUrl = profileColor.imageUrl;
    }
  }

  // Inject for nested quotes as well
  if (jobResult.quotes && jobResult.quotes.length > 0) {
    for (const q of jobResult.quotes) {
      if (q.tileProfileId && q.tileColorId && q.tileColor) {
        const [qProfileColor] = await db
          .select({ imageUrl: tileProfileColor.imageUrl })
          .from(tileProfileColor)
          .where(
            and(
              eq(tileProfileColor.profileId, q.tileProfileId),
              eq(tileProfileColor.colorId, q.tileColorId),
            ),
          );
        if (qProfileColor && qProfileColor.imageUrl) {
          q.tileColor.imageUrl = qProfileColor.imageUrl;
        }
      }
    }
  }

  const {
    area_sq_mt,
    pitch,
    ridges,
    roofFaces,
    confidence,
    createdAt,
    updatedAt,
    activeQuote,
    quotes,
    delivery,
    ...restJob
  } = jobResult;

  if (activeQuote) {
    delete (activeQuote as Partial<typeof activeQuote>).tileColorId;
    delete (activeQuote as Partial<typeof activeQuote>).tileProfileId;
    delete (activeQuote as Partial<typeof activeQuote>).tileTypeId;
  }

  if (quotes) {
    for (const q of quotes) {
      delete (q as Partial<typeof q>).tileColorId;
      delete (q as Partial<typeof q>).tileProfileId;
      delete (q as Partial<typeof q>).tileTypeId;
    }
  }

  if (restJob.jobStatus === 'requested' || restJob.jobStatus === 'delivered') {
    return {
      id: restJob.id,
      address: restJob.address,
      activeQuote: activeQuote,
      delivery: delivery ? [delivery] : [],
    };
  }

  return {
    ...restJob,
    measurement: {
      area_sq_mt,
      pitch,
      ridges,
      roofFaces,
      confidence,
    },
    activeQuote: activeQuote,
    quotes: quotes,
    delivery: delivery ? [delivery] : [],
    createdAt,
    updatedAt,
  };
};

export const getJobAreaService = async (userId: string, id: string) => {
  const jobResult = await db.query.job.findFirst({
    where: and(eq(job.id, id), eq(job.userId, userId)),
    columns: { area_sq_mt: true },
  });

  return jobResult?.area_sq_mt || null;
};

export const updateJobStatusService = async (
  userId: string,
  id: string,
  status: 'quoted' | 'requested' | 'delivered',
) => {
  const [updatedJob] = await db
    .update(job)
    .set({ jobStatus: status })
    .where(and(eq(job.id, id), eq(job.userId, userId)))
    .returning();

  return updatedJob;
};

export const addDropzonePhotosService = async (
  userId: string,
  jobId: string,
  photos: string[],
) => {
  return await db.transaction(async (tx) => {
    const existingJob = await tx.query.job.findFirst({
      where: and(eq(job.id, jobId), eq(job.userId, userId)),
      columns: { dropzonePhotos: true },
    });

    if (!existingJob) {
      throw new ApiError('Job not found', httpStatus.NOT_FOUND);
    }

    const currentPhotos = existingJob.dropzonePhotos || [];

    const newPhotos = photos.map((url) => ({
      url,
      createdAt: new Date().toISOString(),
    }));

    const [updatedJob] = await tx
      .update(job)
      .set({ dropzonePhotos: [...currentPhotos, ...newPhotos] })
      .where(eq(job.id, jobId))
      .returning();

    return updatedJob;
  });
};

export const calculateBomService = async (
  area_sq_mt: number,
  jobType?: string,
  tileTypeId?: string,
  tileProfileId?: string,
) => {
  let materialName = '';
  let profileName = '';

  if (tileTypeId) {
    const tileTypeRec = await db.query.tileType.findFirst({
      where: eq(tileType.id, tileTypeId),
    });
    if (!tileTypeRec) {
      throw new ApiError('Invalid tile type provided.', httpStatus.BAD_REQUEST);
    }
    materialName = tileTypeRec.name;
  }

  if (tileProfileId) {
    const tileProfileRec = await db.query.tileProfile.findFirst({
      where: eq(tileProfile.id, tileProfileId),
    });
    if (!tileProfileRec) {
      throw new ApiError(
        'Invalid tile profile provided.',
        httpStatus.BAD_REQUEST,
      );
    }
    profileName = tileProfileRec.name;
  }

  return calculateBillOfMaterials(
    area_sq_mt,
    materialName,
    jobType ?? '',
    profileName,
  );
};

export const addJobNotesService = async (
  userId: string,
  jobId: string,
  notes: string[],
) => {
  return await db.transaction(async (tx) => {
    const existingJob = await tx.query.job.findFirst({
      where: and(eq(job.id, jobId), eq(job.userId, userId)),
      columns: { additionalNotes: true },
    });

    if (!existingJob) {
      throw new ApiError('Job not found', httpStatus.NOT_FOUND);
    }

    const currentNotes = existingJob.additionalNotes || [];
    const newNotes = notes.map((text) => ({
      text,
      createdAt: new Date().toISOString(),
    }));
    const updatedNotes = [...currentNotes, ...newNotes];

    const [updatedJob] = await tx
      .update(job)
      .set({ additionalNotes: updatedNotes })
      .where(eq(job.id, jobId))
      .returning();

    return updatedJob;
  });
};
