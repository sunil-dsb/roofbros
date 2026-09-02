import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  integer,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import { user } from './auth.schema.ts';
import { quote } from './quote.schema.ts';
import { delivery } from './delivery.schema.ts';
export const jobStatusEnum = pgEnum('job_status_enum', [
  'quoted',
  'requested',
  'delivered',
]);
export const jobTypeEnum = pgEnum('job_type_enum', [
  'new roof installation',
  'roof restoration',
]);

export const job = pgTable('job', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  address: text('address').notNull(),
  activeQuoteId: uuid('active_quote_id').references(
    (): AnyPgColumn => quote.id,
    { onDelete: 'set null' },
  ),

  areaSqmt: decimal('area_sqmt', { precision: 10, scale: 2 }),
  roofImage: text('roof_image'),
  additionalNotes: jsonb('additional_notes')
    .$type<{ text: string; createdAt: string }[]>()
    .default([]),
  dropzonePhotos: jsonb('dropzone_photos')
    .$type<{ url: string; createdAt: string }[]>()
    .default([]),
  confidence: decimal('confidence', { precision: 5, scale: 2 }),
  pitch: decimal('pitch', { precision: 10, scale: 2 }),
  tilesize: decimal('tilesize', { precision: 10, scale: 2 }),
  ridges: decimal('ridges', { precision: 10, scale: 2 }),
  roofFaces: integer('roof_faces'),

  quoteCount: integer('quote_count').default(0),

  jobStatus: jobStatusEnum('job_status').notNull().default('quoted'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const jobRelations = relations(job, ({ one, many }) => ({
  user: one(user, {
    fields: [job.userId],
    references: [user.id],
  }),
  activeQuote: one(quote, {
    fields: [job.activeQuoteId],
    references: [quote.id],
  }),
  delivery: one(delivery, {
    fields: [job.id],
    references: [delivery.jobId],
  }),
  quotes: many(quote),
}));
