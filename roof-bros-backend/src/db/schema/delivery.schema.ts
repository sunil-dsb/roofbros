import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  pgSequence,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

import { job } from './job.schema.ts';
import { quote } from './quote.schema.ts';

export const deliveryMethodEnum = pgEnum('delivery_method_enum', [
  'deliver to site',
  'pickup at yard',
]);

export const timeWindowEnum = pgEnum('time_window_enum', [
  'morning',
  'afternoon',
]);

export const deliveryStatusEnum = pgEnum('delivery_status_enum', [
  'requested',
  'scheduled',
  'out for delivery',
  'delivered',
]);

export const deliverySeq = pgSequence('delivery_seq', { startWith: 1000 });

export const delivery = pgTable('delivery', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .references(() => job.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  quoteId: uuid('quote_id').references(() => quote.id, {
    onDelete: 'set null',
  }),

  // Identifier matching UI (e.g., "DR-2455")
  trackingNumber: text('tracking_number').notNull().unique(),

  // User Inputs
  method: deliveryMethodEnum('method').notNull(),
  deliveryAddress: text('delivery_address'), // null if "pickup at yard"
  preferredDay: timestamp('preferred_day').notNull(),
  timeWindow: timeWindowEnum('time_window').notNull(),
  dropZoneNotes: text('drop_zone_notes'),
  urgent: boolean('urgent').default(false),
  dropZonePhotos: jsonb('drop_zone_photos').$type<string[]>().default([]),

  // Tracking
  status: deliveryStatusEnum('status').default('requested').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  scheduledAt: timestamp('scheduled_at'),
  outForDeliveryAt: timestamp('out_for_delivery_at'),
  deliveredAt: timestamp('delivered_at'),
  proofOfDeliveryPhotos: jsonb('proof_of_delivery_photos')
    .$type<string[]>()
    .default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const deliveryRelations = relations(delivery, ({ one }) => ({
  job: one(job, {
    fields: [delivery.jobId],
    references: [job.id],
  }),
  quote: one(quote, {
    fields: [delivery.quoteId],
    references: [quote.id],
  }),
}));
