import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/utils/catchAsync.ts';
import ApiResponse from '../../shared/utils/ApiResponse.ts';
import {
  getTilesService,
  getProfilesByTileIdService,
  getColorsService,
} from '../../services/tile/tile.service.ts';
import type {
  GetProfilesParamsInput,
  GetProfilesQueryInput,
  GetColorsQueryInput,
} from '../../shared/validations/tile.validation.ts';

export const getTiles = catchAsync(async (_req: Request, res: Response) => {
  const tiles = await getTilesService();
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Tiles fetched successfully', tiles));
});

export const getProfilesByTileId = catchAsync(
  async (_req: Request, res: Response) => {
    const params = res.locals.params as GetProfilesParamsInput;
    const query = res.locals.query as GetProfilesQueryInput;
    const profiles = await getProfilesByTileIdService(
      params.tileId,
      query?.profileType,
    );
    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Profiles fetched successfully', profiles));
  },
);

export const getColors = catchAsync(async (_req: Request, res: Response) => {
  const query = res.locals.query as GetColorsQueryInput;
  const colors = await getColorsService(query?.profileId);
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Colors fetched successfully', colors));
});
