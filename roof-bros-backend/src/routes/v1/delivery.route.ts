import express, { type Router } from 'express';
import {
  requestDelivery,
  markDelivered,
} from '../../controllers/v1/delivery.controller.ts';
import { validate, validateParams } from '../../shared/middlewares/validate.ts';
import {
  requestDeliverySchema,
  markDeliveredSchema,
} from '../../shared/validations/delivery.validation.ts';
import { requireAuth } from '../../shared/middlewares/authenticate.middlewares.ts';
import { apiUploadLimiter } from '../../shared/middlewares/rateLimit.middleware.ts';
import { upload } from '../../shared/middlewares/upload.middleware.ts';
import { z } from 'zod';

const deliveryRoute: Router = express.Router();

deliveryRoute.post(
  '/:jobId/request',
  apiUploadLimiter,
  requireAuth,
  upload.array('image', 5),
  validateParams(z.object({ jobId: z.string().uuid('Invalid Job ID') })),
  validate(requestDeliverySchema),
  requestDelivery,
);

deliveryRoute.put(
  '/:jobId',
  apiUploadLimiter,
  requireAuth,
  upload.array('image', 5),
  validateParams(z.object({ jobId: z.string().uuid('Invalid Job ID') })),
  validate(markDeliveredSchema),
  markDelivered,
);

export default deliveryRoute;
