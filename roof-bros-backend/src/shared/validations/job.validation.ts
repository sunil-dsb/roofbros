import { z } from 'zod';
import { jobTypeEnum, jobStatusEnum } from '../../db/schema/enums.schema.ts';

export const createJobSchema = z.object({
  jobType: z.enum(jobTypeEnum.enumValues, {
    message: 'Job Type is required',
  }),
  address: z
    .string({
      message: 'Address must be a string',
    })
    .min(1, 'Address is required'),
  area_sq_mt: z
    .number({
      message: 'Area must be a number',
    })
    .positive('Area must be a positive number'),
  roofImage: z
    .string({
      message: 'Roof image must be a string',
    })
    .nullable()
    .optional(),
  dropzonePhotos: z
    .array(
      z.string({
        message: 'Dropzone photo URLs must be strings',
      }),
      {
        message: 'Dropzone photos must be an array',
      },
    )
    .nullable()
    .optional(),
  confidence: z
    .number({
      message: 'Confidence must be a number',
    })
    .nullable()
    .optional(),
  pitch: z
    .number({
      message: 'Pitch must be a number',
    })
    .nullable()
    .optional(),
  tileTypeId: z
    .string({
      message: 'Tile Type ID is required',
    })
    .uuid('Invalid tile type ID'),
  tileProfileId: z
    .string({
      message: 'Tile Profile ID is required',
    })
    .uuid('Invalid tile profile ID'),
  tileColorId: z
    .string({
      message: 'Tile Color ID is required',
    })
    .uuid('Invalid tile color ID'),
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
  tilesize: z.number().optional(),
  jobStatus: z.enum(jobStatusEnum.enumValues, {
    message: 'Job Status is required',
  }),
});

export const getJobsSchema = z.object({
  jobStatus: z.enum(jobStatusEnum.enumValues).optional(),
  jobId: z.string().uuid('Invalid job ID').optional(),
  search: z.string().optional(),
  page: z.preprocess(
    (val) => Number(val),
    z.number().int().positive().default(1),
  ),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().int().positive().max(100).default(10),
  ),
});

export const getJobByIdSchema = z.object({
  id: z.string({ message: 'Job ID is required' }).uuid('Invalid job ID'),
});

export const updateJobStatusSchema = z.object({
  jobStatus: z.enum(jobStatusEnum.enumValues, {
    message: 'Job Status is required',
  }),
});

export const calculateBomSchema = z.object({
  area_sq_mt: z.number().positive('Area must be a positive number'),
  jobType: z.enum(jobTypeEnum.enumValues, {
    message: 'Job Type is required',
  }),
  tileTypeId: z
    .string({ message: 'Tile Type ID is required' })
    .uuid('Invalid tile type ID'),
  tileProfileId: z
    .string({ message: 'Tile Profile ID is required' })
    .uuid('Invalid tile profile ID'),
});

export const addJobNotesSchema = z.object({
  notes: z.array(z.string()).min(1, 'At least one note is required'),
});

export const addDropzonePhotosSchema = z.object({
  photos: z.array(z.string()).min(1, 'At least one photo URL is required'),
});
