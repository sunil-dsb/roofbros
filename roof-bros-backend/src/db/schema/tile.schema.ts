import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const tileType = pgTable('tile_type', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tileColor = pgTable('tile_color', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  hexCode: text('hex_code').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const profileTypeEnum = pgEnum('profile_type_enum', [
  'general',
  'restore',
]);

export const tileProfile = pgTable('tile_profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  profileType: profileTypeEnum('profile_type').default('general').notNull(),
  tileTypeId: uuid('tile_type_id')
    .notNull()
    .references(() => tileType.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const tileProfileColor = pgTable(
  'tile_profile_color',
  {
    profileId: uuid('profile_id')
      .notNull()
      .references(() => tileProfile.id, { onDelete: 'cascade' }),
    colorId: uuid('color_id')
      .notNull()
      .references(() => tileColor.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url'),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.colorId] })],
);

export const tileTypeRelations = relations(tileType, ({ many }) => ({
  profiles: many(tileProfile),
}));

export const tileProfileRelations = relations(tileProfile, ({ one, many }) => ({
  type: one(tileType, {
    fields: [tileProfile.tileTypeId],
    references: [tileType.id],
  }),
  profileColors: many(tileProfileColor),
}));

export const tileColorRelations = relations(tileColor, ({ many }) => ({
  profileColors: many(tileProfileColor),
}));

export const tileProfileColorRelations = relations(
  tileProfileColor,
  ({ one }) => ({
    profile: one(tileProfile, {
      fields: [tileProfileColor.profileId],
      references: [tileProfile.id],
    }),
    color: one(tileColor, {
      fields: [tileProfileColor.colorId],
      references: [tileColor.id],
    }),
  }),
);
