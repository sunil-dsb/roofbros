import { z } from 'zod';

export const getCoverageSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

export const getFeaturesSchema = z.object({
  transactionToken: z.string().min(1, 'Transaction Token is required'),
});

export const getStaticMapSchema = z.object({
  transactionToken: z.string().min(1, 'Transaction Token is required'),
  x: z.string().optional().default('0'),
  y: z.string().optional().default('0'),
  tileSize: z.string().optional().default('4096x4096'),
});

export const getConsolidatedDataSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});
