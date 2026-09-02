import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  pgSequence,
  decimal,
} from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { job } from './job.schema.ts';
import { tileType, tileProfile, tileColor } from './tile.schema.ts';

const quoteJobTypeEnum = pgEnum('job_type_enum', [
  'new roof installation',
  'roof restoration',
]);

export const quoteSeq = pgSequence('quote_seq', { startWith: 1000 });

export const quote = pgTable('quote', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .references((): AnyPgColumn => job.id, { onDelete: 'cascade' })
    .notNull(),
  quoteNumber: text('quote_number').unique(),
  areaSqmt: decimal('area_sqmt', { precision: 10, scale: 2 }),
  jobType: quoteJobTypeEnum('job_type'),
  tileTypeId: uuid('tile_type_id').references(() => tileType.id, {
    onDelete: 'set null',
  }),
  tileProfileId: uuid('tile_profile_id').references(() => tileProfile.id, {
    onDelete: 'set null',
  }),
  tileColorId: uuid('tile_color_id').references(() => tileColor.id, {
    onDelete: 'set null',
  }),
  topCoatBuckets: integer('top_coat_buckets'),
  primerType: text('primer_type'),
  primer: integer('primer'),
  totalTiles: integer('total_tiles'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const quoteRelations = relations(quote, ({ one }) => ({
  job: one(job, {
    fields: [quote.jobId],
    references: [job.id],
  }),
  tileType: one(tileType, {
    fields: [quote.tileTypeId],
    references: [tileType.id],
  }),
  tileProfile: one(tileProfile, {
    fields: [quote.tileProfileId],
    references: [tileProfile.id],
  }),
  tileColor: one(tileColor, {
    fields: [quote.tileColorId],
    references: [tileColor.id],
  }),
}));
