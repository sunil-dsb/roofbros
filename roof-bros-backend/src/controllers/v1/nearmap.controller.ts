import type { Request, Response } from 'express';
import * as nearmapService from '../../services/nearmap/nearmap.service.ts';
import catchAsync from '../../shared/utils/catchAsync.ts';
import ApiResponse from '../../shared/utils/ApiResponse.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import { genericUpload } from '../../shared/utils/Upload.ts';
import httpStatus from 'http-status';
export const getCoverage = catchAsync(async (req: Request, res: Response) => {
  const address = req.query.address as string;

  const data = await nearmapService.getCoverageService(address);
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Coverage Fetched Successfully', data));
});

export const getFeatures = catchAsync(async (req: Request, res: Response) => {
  const surveyResourceId = req.params.surveyResourceId as string;
  const transactionToken = req.query.transactionToken as string;

  const data = await nearmapService.getFeaturesService(
    surveyResourceId,
    transactionToken,
  );
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Features Fetched Successfully', data));
});

export const getStaticMap = catchAsync(async (req: Request, res: Response) => {
  const surveyId = req.params.surveyId as string;
  const transactionToken = req.query.transactionToken as string;
  const bbox = req.query.bbox as string;

  const response = await nearmapService.getStaticMapStreamService(
    surveyId,
    transactionToken,
    bbox,
  );

  const contentType = response.headers.get('content-type') || 'image/png';

  if (!response.body) {
    throw new ApiError(
      'No image body returned',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // No jobId exists yet at Nearmap stage — store flat in job/roof_image/
  const fullUrl = await genericUpload(
    'job/roof_image',
    'nearmap.png',
    buffer,
    contentType,
  );

  // Extract only the relative path (e.g. /upload/job/1786012311195_nearmap.png)
  // The frontend will prepend its public dev URL to display it
  const match = fullUrl.match(/\/upload\/.*$/);
  const relativeUrl = match ? match[0] : fullUrl;

  // DO NOT save to DB here, because the job is not created yet.
  // The frontend will pass this `relativeUrl` when it calls `createJob`.

  return res
    .status(httpStatus.OK)
    .json(
      ApiResponse.success('Image uploaded successfully', { url: relativeUrl }),
    );
});

export const getConsolidatedData = catchAsync(
  async (req: Request, res: Response) => {
    const address = req.query.address as string;

    const data = await nearmapService.getConsolidatedDataService(address);
    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Roof details fetched successfully', data));
  },
);
