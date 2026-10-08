import type { Request, Response } from 'express';
import * as quoteService from '../../services/quote/quote.service.ts';
import httpStatus from 'http-status';
import catchAsync from '../../shared/utils/catchAsync.ts';
import ApiResponse from '../../shared/utils/ApiResponse.ts';
import type { CreateQuotePayload } from '../../shared/validations/quote.validation.ts';

export const createQuote = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;
  const jobId = req.params.jobId as string;
  const payload = req.body as CreateQuotePayload;

  const quote = await quoteService.createQuoteService(userId, {
    ...payload,
    jobId,
  });

  return res
    .status(httpStatus.CREATED)
    .json(ApiResponse.success('Quote Created Successfully', quote));
});

export const getQuotesByJobId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id as string;
    const jobId = req.params.jobId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await quoteService.getQuotesByJobIdService(
      userId,
      jobId as string,
      page,
      limit,
    );

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Quotes Fetched Successfully', result));
  },
);

export const getQuoteById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;
  const quoteId = req.params.quoteId;

  const quote = await quoteService.getQuoteByIdService(
    userId,
    quoteId as string,
  );

  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Quote Fetched Successfully', quote));
});
