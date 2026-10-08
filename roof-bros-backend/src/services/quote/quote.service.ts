import { db } from '../../config/db.ts';
import { job } from '../../db/schema/job.schema.ts';
import { quote } from '../../db/schema/quote.schema.ts';
import { eq, sql, and, count } from 'drizzle-orm';
import {
  tileType,
  tileProfile,
  tileColor,
  tileProfileColor,
} from '../../db/schema/tile.schema.ts';
import type { CreateQuotePayload } from '../../shared/validations/quote.validation.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import httpStatus from 'http-status';

export const createQuoteService = async (
  userId: string,
  payload: CreateQuotePayload & { jobId: string },
) => {
  const jobExists = await db.query.job.findFirst({
    where: and(eq(job.id, payload.jobId), eq(job.userId, userId)),
  });

  if (!jobExists) {
    throw new ApiError('Job not found', httpStatus.NOT_FOUND);
  }

  const finalTileTypeId = payload.tileTypeId || null;
  const finalTileProfileId = payload.tileProfileId || null;
  const finalTileColorId = payload.tileColorId || null;

  if (finalTileTypeId) {
    const typeExists = await db.query.tileType.findFirst({
      where: eq(tileType.id, finalTileTypeId),
    });
    if (!typeExists) {
      throw new ApiError('Invalid tile type provided.', httpStatus.BAD_REQUEST);
    }
  }

  if (finalTileProfileId) {
    const profileExists = await db.query.tileProfile.findFirst({
      where: eq(tileProfile.id, finalTileProfileId),
    });
    if (!profileExists) {
      throw new ApiError(
        'Invalid tile profile provided.',
        httpStatus.BAD_REQUEST,
      );
    }
  }

  if (finalTileColorId) {
    const colorExists = await db.query.tileColor.findFirst({
      where: eq(tileColor.id, finalTileColorId),
    });
    if (!colorExists) {
      throw new ApiError(
        'Invalid tile color provided.',
        httpStatus.BAD_REQUEST,
      );
    }
  }

  const createdQuote = await db.transaction(async (tx) => {
    const seqResult = await tx.execute(sql`SELECT nextval('quote_seq')`);
    const row = seqResult.rows[0];
    if (!row)
      throw new ApiError(
        'Failed to generate quote number',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    const nextVal = row.nextval;
    const quoteNumber = `Q-${nextVal}`;
    const [newQuote] = await tx
      .insert(quote)
      .values({
        jobId: payload.jobId,
        quoteNumber,
        area_sq_mt: payload.area_sq_mt ? payload.area_sq_mt.toString() : null,
        jobType: payload.jobType || null,
        tileTypeId: finalTileTypeId,
        tileProfileId: finalTileProfileId,
        tileColorId: finalTileColorId,
        topCoatBuckets: payload.topCoatBuckets ?? null,
        primer: payload.primer ?? null,
        primerType: payload.primerType ?? null,
        totalTiles: payload.totalTiles ?? null,
      })
      .returning();

    if (!newQuote) {
      throw new ApiError(
        'Failed to create quote',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await tx
      .update(job)
      .set({
        quoteCount: sql`${job.quoteCount} + 1`,
        activeQuoteId: newQuote.id,
      })
      .where(eq(job.id, payload.jobId));

    return newQuote;
  });

  return await getQuoteByIdService(userId, createdQuote.id);
};

export const getQuotesByJobIdService = async (
  userId: string,
  jobId: string,
  page: number = 1,
  limit: number = 10,
) => {
  // First do a lightweight ownership check
  const jobExists = await db.query.job.findFirst({
    where: and(eq(job.id, jobId), eq(job.userId, userId)),
    columns: { id: true },
  });

  if (!jobExists) {
    throw new ApiError('Job not found', httpStatus.NOT_FOUND);
  }

  const offset = (page - 1) * limit;

  const [totalCountResult] = await db
    .select({ count: count() })
    .from(quote)
    .where(eq(quote.jobId, jobId));

  const totalCount = totalCountResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const quotes = await db.query.quote.findMany({
    where: eq(quote.jobId, jobId),
    limit,
    offset,
    with: {
      tileType: true,
      tileProfile: true,
      tileColor: true,
      job: {
        columns: {
          address: true,
          userId: true,
        },
      },
    },
  });

  for (const q of quotes) {
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

  return {
    quotes,
    meta: {
      totalCount,
      page,
      limit,
      totalPages,
    },
  };
};

export const getQuoteByIdService = async (userId: string, quoteId: string) => {
  const singleQuote = await db.query.quote.findFirst({
    where: eq(quote.id, quoteId),
    with: {
      tileType: true,
      tileProfile: true,
      tileColor: true,
      job: {
        columns: {
          userId: true,
        },
      },
    },
  });

  if (!singleQuote || singleQuote.job?.userId !== userId) {
    throw new ApiError('Quote not found', httpStatus.NOT_FOUND);
  }

  if (
    singleQuote.tileProfileId &&
    singleQuote.tileColorId &&
    singleQuote.tileColor
  ) {
    const [qProfileColor] = await db
      .select({ imageUrl: tileProfileColor.imageUrl })
      .from(tileProfileColor)
      .where(
        and(
          eq(tileProfileColor.profileId, singleQuote.tileProfileId),
          eq(tileProfileColor.colorId, singleQuote.tileColorId),
        ),
      );
    if (qProfileColor && qProfileColor.imageUrl) {
      singleQuote.tileColor.imageUrl = qProfileColor.imageUrl;
    }
  }

  return singleQuote;
};
