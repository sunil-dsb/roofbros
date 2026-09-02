import express, { type Router } from 'express';
import {
  getCoverage,
  getFeatures,
  getStaticMap,
  getConsolidatedData,
} from '../../controllers/v1/nearmap.controller.ts';
import { validateQuery } from '../../shared/middlewares/validate.ts';
import {
  getCoverageSchema,
  getFeaturesSchema,
  getStaticMapSchema,
  getConsolidatedDataSchema,
} from '../../shared/validations/nearmap.validation.ts';
import { requireAuth } from '../../shared/middlewares/authenticate.middlewares.ts';
import { apiSearchLimiter } from '../../shared/middlewares/rateLimit.middleware.ts';

const nearmapRoute: Router = express.Router();

nearmapRoute.get(
  '/coverage',
  apiSearchLimiter,
  requireAuth,
  validateQuery(getCoverageSchema),
  getCoverage,
);
nearmapRoute.get(
  '/features/:surveyResourceId',
  apiSearchLimiter,
  requireAuth,
  validateQuery(getFeaturesSchema),
  getFeatures,
);
nearmapRoute.get(
  '/staticmap/:surveyId',
  apiSearchLimiter,
  requireAuth,
  validateQuery(getStaticMapSchema),
  getStaticMap,
);
nearmapRoute.get(
  '/roof-details',
  apiSearchLimiter,
  requireAuth,
  validateQuery(getConsolidatedDataSchema),
  getConsolidatedData,
);

export default nearmapRoute;
