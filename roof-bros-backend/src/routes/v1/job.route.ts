import express, { type Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  calculateBom,
  updateJobStatus,
  addJobNotes,
  addDropzonePhotos,
  getJobArea,
} from '../../controllers/v1/job.controller.ts';
import { upload } from '../../shared/middlewares/upload.middleware.ts';
import {
  validate,
  validateQuery,
  validateParams,
} from '../../shared/middlewares/validate.ts';
import {
  calculateBomSchema,
  createJobSchema,
  getJobsSchema,
  getJobByIdSchema,
  updateJobStatusSchema,
  addJobNotesSchema,
} from '../../shared/validations/job.validation.ts';
import {
  apiReadLimiter,
  apiWriteLimiter,
  apiSearchLimiter,
  apiUploadLimiter,
} from '../../shared/middlewares/rateLimit.middleware.ts';
import { requireVerifiedEmail } from '../../shared/middlewares/authenticate.middlewares.ts';

const jobRoute: Router = express.Router();

jobRoute.get(
  '/',
  apiSearchLimiter,
  requireVerifiedEmail,
  validateQuery(getJobsSchema),
  getJobs,
);

jobRoute.get(
  '/details/:id',
  apiReadLimiter,
  requireVerifiedEmail,
  validateParams(getJobByIdSchema),
  getJobById,
);

jobRoute.get(
  '/:id/area',
  apiReadLimiter,
  requireVerifiedEmail,
  validateParams(getJobByIdSchema),
  getJobArea,
);

jobRoute.patch(
  '/:id/status',
  apiWriteLimiter,
  requireVerifiedEmail,
  validateParams(getJobByIdSchema),
  validate(updateJobStatusSchema),
  updateJobStatus,
);

jobRoute.post(
  '/create',
  apiWriteLimiter,
  requireVerifiedEmail,
  validate(createJobSchema),
  createJob,
);

jobRoute.post(
  '/calculateMaterial',
  apiWriteLimiter,
  requireVerifiedEmail,
  validate(calculateBomSchema),
  calculateBom,
);

jobRoute.patch(
  '/:id/notes',
  apiWriteLimiter,
  requireVerifiedEmail,
  validateParams(getJobByIdSchema),
  validate(addJobNotesSchema),
  addJobNotes,
);

jobRoute.patch(
  '/:id/dropzone-photos',
  apiUploadLimiter,
  requireVerifiedEmail,
  upload.array('images', 5),
  addDropzonePhotos,
);

export default jobRoute;
