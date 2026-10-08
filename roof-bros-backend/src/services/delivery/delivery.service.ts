import { eq, sql, and } from 'drizzle-orm';
import { db } from '../../config/db.ts';
import { job } from '../../db/schema/job.schema.ts';
import { quote } from '../../db/schema/quote.schema.ts';
import { delivery } from '../../db/schema/delivery.schema.ts';
import { z } from 'zod';
import {
  requestDeliverySchema,
  markDeliveredSchema,
} from '../../shared/validations/delivery.validation.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import httpStatus from 'http-status';

export const requestDeliveryService = async (
  userId: string,
  jobId: string,
  payload: z.infer<typeof requestDeliverySchema>,
) => {
  return await db.transaction(async (tx) => {
    // 1. Verify the job exists and is in 'quoted' status
    const existingJob = await tx.query.job.findFirst({
      where: and(eq(job.id, jobId), eq(job.userId, userId)),
    });

    if (!existingJob) {
      throw new ApiError('Job not found', httpStatus.NOT_FOUND);
    }

    if (existingJob.jobStatus !== 'quoted') {
      throw new ApiError(
        'Job must be in quoted status to request delivery',
        httpStatus.BAD_REQUEST,
      );
    }

    if (payload.quoteId) {
      const existingQuote = await tx.query.quote.findFirst({
        where: eq(quote.id, payload.quoteId),
      });
      if (!existingQuote) {
        throw new ApiError('Invalid quote provided.', httpStatus.BAD_REQUEST);
      }
    }

    // 2. Check if a delivery already exists for this job
    const existingDelivery = await tx
      .select()
      .from(delivery)
      .where(eq(delivery.jobId, jobId))
      .limit(1);

    if (existingDelivery && existingDelivery.length > 0) {
      throw new ApiError('Delivery already requested', httpStatus.BAD_REQUEST);
    }

    // 3. Update job status to 'requested' and update active quote if provided
    const [updatedJob] = await tx
      .update(job)
      .set({
        jobStatus: 'requested',
        ...(payload.quoteId ? { activeQuoteId: payload.quoteId } : {}),
      })
      .where(eq(job.id, jobId))
      .returning();

    // 4. Generate a unique tracking number e.g. DR-452189
    const seqResult = await tx.execute(sql`SELECT nextval('delivery_seq')`);
    const row = seqResult.rows[0];
    if (!row) {
      throw new ApiError(
        'Failed to generate delivery tracking number',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const trackingNumber = `DR-${row.nextval}`;

    // 5. Create the delivery record
    const [newDelivery] = await tx
      .insert(delivery)
      .values({
        jobId,
        quoteId: payload.quoteId || null,
        trackingNumber,
        method: payload.method,
        deliveryAddress: payload.deliveryAddress,
        preferredDay: new Date(payload.preferredDay),
        timeWindow: payload.timeWindow,
        dropZoneNotes: payload.dropZoneNotes,
        urgent: payload.urgent ?? false,
        dropZonePhotos: payload.dropZonePhotos || [],
        status: 'requested',
      })
      .returning();

    return { job: updatedJob, delivery: newDelivery };
  });
};

export const markDeliveredService = async (
  userId: string,
  jobId: string,
  payload: z.infer<typeof markDeliveredSchema>,
) => {
  return await db.transaction(async (tx) => {
    let newDeliveryStatus:
      'requested' | 'scheduled' | 'out for delivery' | 'delivered' =
      'requested';
    if (payload.scheduledAt) newDeliveryStatus = 'scheduled';
    if (payload.outForDeliveryAt) newDeliveryStatus = 'out for delivery';
    if (
      payload.deliveredAt ||
      (payload.proofOfDeliveryPhotos &&
        payload.proofOfDeliveryPhotos.length > 0)
    )
      newDeliveryStatus = 'delivered';

    let newJobStatus: 'requested' | 'delivered' = 'requested';
    if (newDeliveryStatus === 'delivered') {
      newJobStatus = 'delivered';
    }

    // 1. Update job status
    const [updatedJob] = await tx
      .update(job)
      .set({ jobStatus: newJobStatus })
      .where(and(eq(job.id, jobId), eq(job.userId, userId)))
      .returning();

    if (!updatedJob) {
      throw new ApiError('Job not found', httpStatus.NOT_FOUND);
    }

    // 2. Fetch existing delivery to append photos
    const [existingDelivery] = await tx
      .select()
      .from(delivery)
      .where(eq(delivery.jobId, jobId));

    if (!existingDelivery) {
      throw new ApiError('Delivery not found', httpStatus.NOT_FOUND);
    }

    const updatedPhotos = existingDelivery.proofOfDeliveryPhotos || [];
    if (
      payload.proofOfDeliveryPhotos &&
      payload.proofOfDeliveryPhotos.length > 0
    ) {
      updatedPhotos.push(...payload.proofOfDeliveryPhotos);
    }

    // 3. Update the delivery record
    const [updatedDelivery] = await tx
      .update(delivery)
      .set({
        status: newDeliveryStatus,
        scheduledAt: payload.scheduledAt
          ? new Date(payload.scheduledAt)
          : undefined,
        outForDeliveryAt: payload.outForDeliveryAt
          ? new Date(payload.outForDeliveryAt)
          : undefined,
        deliveredAt: payload.deliveredAt
          ? new Date(payload.deliveredAt)
          : newDeliveryStatus === 'delivered'
            ? new Date()
            : undefined,
        proofOfDeliveryPhotos: updatedPhotos,
      })
      .where(eq(delivery.jobId, jobId))
      .returning();

    return { job: updatedJob, delivery: updatedDelivery };
  });
};
