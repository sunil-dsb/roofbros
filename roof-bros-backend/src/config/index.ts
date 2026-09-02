import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Load .env file first, if any
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(
    __dirname,
    `../../${process.env.NODE_ENV || 'development'}.env`,
  ),
});

const envVarsSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().default(9000)),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  CORS: z.string(),
  RESEND_API_KEY: z.string(),
  REGION: z.string().optional(),
  ACCESS_KEY_ID: z.string().optional(),
  SECRET_ACCESS_KEY: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  BUCKET_NAME: z.string().optional(),
  PUBLIC_R2_ENDPOINT: z.string().optional(),
  APPLE_CLIENT_ID: z.string(),
  APPLE_TEAM_ID: z.string(),
  APPLE_KEY_ID: z.string(),
  APPLE_PRIVATE_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GUID: z.string(),
  NEARMAP_API_KEY: z.string(),
  NEARMAP_AUTH_TOKEN: z.string().optional(),
});

const response = envVarsSchema.safeParse(process.env);

if (!response.success) {
  // Name the offending variable in every issue. Without the path, a container
  // that is missing its whole environment just repeats "expected string,
  // received undefined" once per variable, which says nothing about which.
  const issues = response.error.issues.map((issue) => {
    const name = issue.path.join('.') || '(root)';
    return issue.code === 'invalid_type' && issue.input === undefined
      ? `${name} is missing`
      : `${name}: ${issue.message}`;
  });

  throw new Error(`Config validation error: ${issues.join(', ')}`);
}

const envVars = response.data;

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  betterAuthSecret: envVars.BETTER_AUTH_SECRET,
  betterAuthUrl: envVars.BETTER_AUTH_URL,
  cors: envVars.CORS.split(','),
  resendApiKey: envVars.RESEND_API_KEY,
  region: envVars.REGION,
  accessKeyId: envVars.ACCESS_KEY_ID,
  secretAccessKey: envVars.SECRET_ACCESS_KEY,
  r2Endpoint: envVars.R2_ENDPOINT,
  bucket: envVars.BUCKET_NAME,
  publicR2Endpoint: envVars.PUBLIC_R2_ENDPOINT,
  appleClientId: envVars.APPLE_CLIENT_ID,
  appleTeamId: envVars.APPLE_TEAM_ID,
  appleKeyId: envVars.APPLE_KEY_ID,
  applePrivateKey: envVars.APPLE_PRIVATE_KEY,
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
  abrGuid: envVars.GUID,
  nearmapApiKey: envVars.NEARMAP_API_KEY,
  nearmapAuthToken: envVars.NEARMAP_AUTH_TOKEN,
};

export default config;
