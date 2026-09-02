import express, { type Router } from 'express';
import {
  getTiles,
  getProfilesByTileId,
  getColors,
} from '../../controllers/v1/tile.controller.ts';
import {
  validateParams,
  validateQuery,
} from '../../shared/middlewares/validate.ts';
import {
  getColorsQuerySchema,
  getProfilesParamsSchema,
  getProfilesQuerySchema,
} from '../../shared/validations/tile.validation.ts';
import { apiSearchLimiter } from '../../shared/middlewares/rateLimit.middleware.ts';
import { requireVerifiedEmail } from '../../shared/middlewares/authenticate.middlewares.ts';

const tileRoute: Router = express.Router();

tileRoute.get('/', apiSearchLimiter, requireVerifiedEmail, getTiles);

tileRoute.get(
  '/:tileId/profiles',
  apiSearchLimiter,
  requireVerifiedEmail,
  validateParams(getProfilesParamsSchema),
  validateQuery(getProfilesQuerySchema),
  getProfilesByTileId,
);

tileRoute.get(
  '/colors',
  apiSearchLimiter,
  requireVerifiedEmail,
  validateQuery(getColorsQuerySchema),
  getColors,
);

export default tileRoute;
