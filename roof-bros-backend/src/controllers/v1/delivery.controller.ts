import type { Request, Response } from 'express';
import * as deliveryService from '../../services/delivery/delivery.service.ts';
import httpStatus from 'http-status';
import catchAsync from '../../shared/utils/catchAsync.ts';
import ApiResponse from '../../shared/utils/ApiResponse.ts';
import { genericUpload } from '../../shared/utils/Upload.ts';

export const requestDelivery = catchAsync(
  async (req: Request, res: Response) => {
    const jobId = req.params.jobId as string;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const urls = await Promise.all(
        req.files.map((file) =>
          genericUpload(
            `job/requested/${jobId}`,
            file.originalname,
            file.buffer,
            file.mimetype,
          ),
        ),
      );
      req.body.dropZonePhotos = urls;
    }

    const result = await deliveryService.requestDeliveryService(
      jobId,
      req.body,
    );

    return res
      .status(httpStatus.CREATED)
      .json(ApiResponse.success('Delivery Requested Successfully', result));
  },
);

export const markDelivered = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const urls = await Promise.all(
      req.files.map((file) =>
        genericUpload(
          `job/delivered/${jobId}`,
          file.originalname,
          file.buffer,
          file.mimetype,
        ),
      ),
    );
    req.body.proofOfDeliveryPhotos = urls;
  }

  const result = await deliveryService.markDeliveredService(jobId, req.body);

  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Delivery Status Updated Successfully', result));
});
