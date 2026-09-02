import { S3Client } from '@aws-sdk/client-s3';
import config from '../../config/index.ts';

export const s3 = new S3Client({
  region: config.region || 'auto',
  endpoint: config.r2Endpoint || '',
  credentials: {
    accessKeyId: config.accessKeyId || '',
    secretAccessKey: config.secretAccessKey || '',
  },
});
