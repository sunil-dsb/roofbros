import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { s3 } from './S3Client.ts';
import config from '../../config/index.ts';
import crypto from 'crypto';

export const Upload = async (
  key: string,
  body: NonNullable<PutObjectCommandInput['Body']>,
) => {
  // Upload a file
  const response = await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
    }),
  );
  return response;
};

export const Download = async (key: string) => {
  // Download a file
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
  if (!response.Body) {
    throw new Error(`No body returned for key: ${key}`);
  }
  const content = await response.Body.transformToString();
  return content;
};

export const ListFiles = async (prefix?: string) => {
  // List objects
  const response = await s3.send(
    new ListObjectsV2Command({ Bucket: config.bucket, Prefix: prefix }),
  );
  return response.Contents ?? [];
};

export const genericUpload = async (
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType: string = 'image/png',
) => {
  // Sanitize folder to avoid path traversal, but allow slashes for nested folders
  const safeFolder = folder
    .replace(/[^a-zA-Z0-9_/-]/g, '')
    .replace(/\/+/g, '/') // replace multiple slashes with a single one
    .replace(/^\/|\/$/g, ''); // remove leading and trailing slashes
  const uniqueId = crypto.randomBytes(8).toString('hex'); // 16-character random hex string
  const key = safeFolder
    ? `uploads/${safeFolder}/${uniqueId}_${filename}`
    : `uploads/${uniqueId}_${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `/${key}`;
};
