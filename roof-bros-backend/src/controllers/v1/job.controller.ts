import type { Request, Response } from 'express';
import * as jobService from '../../services/job/job.service.ts';

import catchAsync from '../../shared/utils/catchAsync.ts';
import ApiResponse from '../../shared/utils/ApiResponse.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import { genericUpload } from '../../shared/utils/Upload.ts';
import httpStatus from 'http-status';

export const createJob = catchAsync(async (req: Request, res: Response) => {
  // Inject the authenticated user's ID from the session — never trust the client to send it
  const userId = req.auth?.user?.id as string;
  const job = await jobService.createJobService(req.body, userId);
  return res
    .status(httpStatus.CREATED)
    .json(ApiResponse.success('Job Created Successfully', job));
});

export const getJobs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;
  const jobStatus = req.query.jobStatus as
    'quoted' | 'requested' | 'delivered' | undefined;
  const jobId = req.query.jobId as string | undefined;
  const search = req.query.search as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await jobService.getJobsService(
    userId,
    jobStatus,
    jobId,
    search,
    page,
    limit,
  );
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Jobs Fetched Successfully', result));
});

export const getJobById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;
  const id = req.params.id as string;
  const search = req.query.search as string | undefined;
  const job = await jobService.getJobByIdService(userId, id, search);

  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Job Fetched Successfully', job));
});

export const getJobArea = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;
  const id = req.params.id as string;
  const area = await jobService.getJobAreaService(userId, id);

  return res.status(httpStatus.OK).json(
    ApiResponse.success('Job Area Fetched Successfully', {
      area_sq_mt: parseFloat(area || '0'),
    }),
  );
});

export const updateJobStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id as string;
    const id = req.params.id as string;
    const { jobStatus } = req.body;

    const updatedJob = await jobService.updateJobStatusService(
      userId,
      id,
      jobStatus,
    );

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Job Status Updated Successfully', updatedJob));
  },
);

export const calculateBom = catchAsync(async (req: Request, res: Response) => {
  const { area_sq_mt, jobType, tileTypeId, tileProfileId } = req.body;

  const materials = await jobService.calculateBomService(
    area_sq_mt,
    jobType,
    tileTypeId,
    tileProfileId,
  );

  return res.status(httpStatus.OK).json(
    ApiResponse.success('Materials Calculated Successfully', {
      area_sq_mt,
      ...materials,
    }),
  );
});

export const addJobNotes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;
  const id = req.params.id as string;
  const { notes } = req.body;

  const updatedJob = await jobService.addJobNotesService(userId, id, notes);
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Job Notes Added Successfully', updatedJob));
});

export const addDropzonePhotos = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = req.auth?.user?.id as string;

    const files =
      (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    if (files.length === 0) {
      throw new ApiError('No images provided', httpStatus.BAD_REQUEST);
    }

    // Ensure job belongs to user before uploading to R2
    const { db } = await import('../../config/db.ts');
    const { job } = await import('../../db/schema/job.schema.ts');
    const { and, eq } = await import('drizzle-orm');

    const existingJob = await db.query.job.findFirst({
      where: and(eq(job.id, id), eq(job.userId, userId)),
    });

    if (!existingJob) {
      throw new ApiError('Job not found', httpStatus.NOT_FOUND);
    }

    const folder = `job/dropzone/${id}`;

    // Upload files directly to R2
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        genericUpload(folder, file.originalname, file.buffer, file.mimetype),
      ),
    );

    const updatedJob = await jobService.addDropzonePhotosService(
      userId,
      id,
      uploadedUrls,
    );
    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.success(
          'Dropzone Photos Uploaded Successfully',
          updatedJob,
        ),
      );
  },
);
