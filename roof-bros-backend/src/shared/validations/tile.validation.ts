import { z } from 'zod';

export const getProfilesParamsSchema = z.object({
  tileId: z
    .string({ message: 'Tile ID is required' })
    .uuid('Invalid tile ID format'),
});

export type GetProfilesParamsInput = z.infer<typeof getProfilesParamsSchema>;

export const getProfilesQuerySchema = z.object({
  profileType: z.enum(['general', 'restore'], {
    message: 'Profile Type is required',
  }),
});

export type GetProfilesQueryInput = z.infer<typeof getProfilesQuerySchema>;

export const getColorsQuerySchema = z.object({
  profileId: z
    .string({ message: 'Profile ID is required' })
    .uuid('Invalid profile ID format'),
});

export type GetColorsQueryInput = z.infer<typeof getColorsQuerySchema>;
