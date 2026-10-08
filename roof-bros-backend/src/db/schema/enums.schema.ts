import { pgEnum } from 'drizzle-orm/pg-core';

export const jobStatusEnum = pgEnum('job_status_enum', [
  'quoted',
  'requested',
  'delivered',
]);

export const jobTypeEnum = pgEnum('job_type_enum', [
  'new roof installation',
  'roof restoration',
]);
