import { z } from 'zod';
import { jobTypeEnum } from '../../db/schema/job.schema.ts';

export const createQuoteSchema = z.object({
  // Nullable in the DB (decimal, no notNull) — treat empty string as null
  area_sq_mt: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .number({ message: 'Area must be a number' })
      .min(0, 'Area cannot be negative')
      .nullable()
      .optional(),
  ),

  jobType: z
    .enum(jobTypeEnum.enumValues, { message: 'Job Type is required' })
    .nullable()
    .optional(),

  // FK columns — nullable in the DB (onDelete: 'set null')
  tileTypeId: z.string().uuid('Invalid tile type ID').nullable().optional(),
  tileProfileId: z
    .string()
    .uuid('Invalid tile profile ID')
    .nullable()
    .optional(),
  tileColorId: z.string().uuid('Invalid tile color ID').nullable().optional(),

  // Nullable integers — match job.validation.ts preprocess pattern
  topCoatBuckets: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .number({ message: 'Top coat buckets must be a number' })
      .min(0, 'Top coat buckets cannot be negative')
      .nullable()
      .optional(),
  ),

  primerType: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string({ message: 'Primer type must be a string' }).nullable().optional(),
  ),

  primer: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .number({ message: 'Primer must be a number' })
      .min(0, 'Primer cannot be negative')
      .nullable()
      .optional(),
  ),

  totalTiles: z.preprocess(
    (val) => (val === '' ? null : val),
    z
      .number({ message: 'Total tiles must be a number' })
      .int('Total tiles must be an integer')
      .min(0, 'Total tiles cannot be negative')
      .nullable()
      .optional(),
  ),
});

export type CreateQuotePayload = z.infer<typeof createQuoteSchema>;
