import { z } from 'zod';
import { jobTypeEnum } from '../../db/schema/enums.schema.ts';

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
    .enum(jobTypeEnum.enumValues, { message: 'Invalid job type' })
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
  topCoatBuckets: z.number().optional(),
  primer: z.number().optional(),
  primerType: z
    .enum([
      'High Build Primer',
      'WB Sealer',
      'Terracotta Primer',
      'Metal Primer',
      'None',
    ])
    .optional(),
  totalTiles: z.number().optional(),
});

export type CreateQuotePayload = z.infer<typeof createQuoteSchema>;
