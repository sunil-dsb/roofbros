import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, `../${process.env.NODE_ENV || 'development'}.env`),
});

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';
import {
  tileProfile,
  tileColor,
  tileProfileColor,
} from '../db/schema/tile.schema.ts';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const imageMap: Record<string, string> = {
  atura_aniseed: '/uploads/concrete/atura/atura_aniseed.png',
  atura_babylon: '/uploads/concrete/atura/atura_babylon.png',
  atura_barramundi: '/uploads/concrete/atura/atura_barramundi.png',
  atura_camelot: '/uploads/concrete/atura/atura_camelot.png',
  atura_caraway: '/uploads/concrete/atura/atura_caraway.png',
  atura_chilli: '/uploads/concrete/atura/atura_chilli.png',
  'atura_mist-grey': '/uploads/concrete/atura/atura_mist-grey.png',
  'atura_salt-spray': '/uploads/concrete/atura/atura_salt-spray.png',
  atura_sambuca: '/uploads/concrete/atura/atura_sambuca.png',
  atura_seashell: '/uploads/concrete/atura/atura_seashell.png',
  'atura_silver-perch': '/uploads/concrete/atura/atura_silver-perch.png',
  'atura_wild-rice': '/uploads/concrete/atura/atura_wild-rice.png',
  atura_wollemi: '/uploads/concrete/atura/atura_wollemi.png',
  'cambridge_soho-night':
    '/uploads/concrete/cambridge/cambridge_soho-night.png',
  elabana_aniseed: '/uploads/concrete/elabana/elabana_aniseed.png',
  elabana_babylon: '/uploads/concrete/elabana/elabana_babylon.png',
  elabana_barramundi: '/uploads/concrete/elabana/elabana_barramundi.png',
  elabana_chilli: '/uploads/concrete/elabana/elabana_chilli.png',
  elabana_mist_gray: '/uploads/concrete/elabana/elabana_mist_gray.jpg',
  elabana_saffron: '/uploads/concrete/elabana/elabana_saffron.png',
  'elabana_salt-spray': '/uploads/concrete/elabana/elabana_salt-spray.png',
  elabana_sambuca: '/uploads/concrete/elabana/elabana_sambuca.png',
  'elabana_sea-shell': '/uploads/concrete/elabana/elabana_sea-shell.png',
  'elabana_wild-rice': '/uploads/concrete/elabana/elabana_wild-rice.png',
  horizon_aniseed: '/uploads/concrete/horizon/horizon_aniseed.png',
  horizon_babylon: '/uploads/concrete/horizon/horizon_babylon.png',
  horizon_barramundi: '/uploads/concrete/horizon/horizon_barramundi.png',
  horizon_camelot: '/uploads/concrete/horizon/horizon_camelot.png',
  horizon_caraway: '/uploads/concrete/horizon/horizon_caraway.png',
  'horizon_mist-grey': '/uploads/concrete/horizon/horizon_mist-grey.png',
  'horizon_salt-spray': '/uploads/concrete/horizon/horizon_salt-spray.png',
  horizon_sambuca: '/uploads/concrete/horizon/horizon_sambuca.png',
  'horizon_sea-shell': '/uploads/concrete/horizon/horizon_sea-shell.png',
  'horizon_silver-perch': '/uploads/concrete/horizon/horizon_silver-perch.png',
  'horizon_wild-rice': '/uploads/concrete/horizon/horizon_wild-rice.png',
  horizon_wollemi: '/uploads/concrete/horizon/horizon_wollemi.png',
  'madison_soho-night': '/uploads/concrete/madison/madison_soho-night.png',
  marseille_aurora: '/uploads/terracotta/marseille/marseille_aurora.png',
  marseille_bedrock: '/uploads/terracotta/marseille/marseille_bedrock.png',
  marseille_comet: '/uploads/terracotta/marseille/marseille_comet.png',
  'marseille_cottage-red':
    '/uploads/terracotta/marseille/marseille_cottage-red.png',
  marseille_earth: '/uploads/terracotta/marseille/marseille_earth.png',
  'marseille_florence-red':
    '/uploads/terracotta/marseille/marseille_florence-red.png',
  marseille_mars: '/uploads/terracotta/marseille/marseille_mars.png',
  'marseille_mystic-grey':
    '/uploads/terracotta/marseille/marseille_mystic-grey.png',
  marseille_peak: '/uploads/terracotta/marseille/marseille_peak.png',
  'marseille_pottery-brown':
    '/uploads/terracotta/marseille/marseille_pottery-brown.png',
  marseille_riverstone:
    '/uploads/terracotta/marseille/marseille_riverstone.png',
  marseille_sunset: '/uploads/terracotta/marseille/marseille_sunset.png',
  marseille_tanbark: '/uploads/terracotta/marseille/marseille_tanbark.png',
  'marseille_titan-gloss':
    '/uploads/terracotta/marseille/marseille_titan-gloss.png',
  nouveau_bedrock: '/uploads/terracotta/nouveau/nouveau_bedrock.png',
  nouveau_comet: '/uploads/terracotta/nouveau/nouveau_comet.png',
  nouveau_earth: '/uploads/terracotta/nouveau/nouveau_earth.png',
  nouveau_mars: '/uploads/terracotta/nouveau/nouveau_mars.png',
  nouveau_peak: '/uploads/terracotta/nouveau/nouveau_peak.png',
  nouveau_ravine: '/uploads/terracotta/nouveau/nouveau_ravine.png',
  nouveau_riverstone: '/uploads/terracotta/nouveau/nouveau_riverstone.png',
  nouveau_titan: '/uploads/terracotta/nouveau/nouveau_titan.png',
  tudor_barramundi: '/uploads/concrete/tudor/tudor_barramundi.png',
  tudor_sambuca: '/uploads/concrete/tudor/tudor_sambuca.png',
  'urban-shingle_bedrock':
    '/uploads/terracotta/urban-shingle/urban-shingle_bedrock.png',
  'urban-shingle_earth':
    '/uploads/terracotta/urban-shingle/urban-shingle_earth.png',
  'urban-shingle_peak':
    '/uploads/terracotta/urban-shingle/urban-shingle_peak.png',
  'urban-shingle_ravine':
    '/uploads/terracotta/urban-shingle/urban-shingle_ravine.png',
  'urban-shingle_titan':
    '/uploads/terracotta/urban-shingle/urban-shingle_titan.png',
};

// Normalise a display name to the key format used in imageMap:
// lowercase, spaces → hyphens
function toKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

async function seed() {
  console.log('Updating tile_profile_color image_url...\n');

  // Preload lookups
  const allProfiles = await db.select().from(tileProfile);
  const allColors = await db.select().from(tileColor);

  const profileMap = new Map(allProfiles.map((p) => [toKey(p.name), p.id]));
  const colorMap = new Map(allColors.map((c) => [toKey(c.name), c.id]));

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [key, imageUrl] of Object.entries(imageMap)) {
    const lastUnderscore = key.lastIndexOf('_');
    const profileKey = key.slice(0, lastUnderscore);
    const colorKey = key.slice(lastUnderscore + 1);

    const profileId = profileMap.get(profileKey);
    const colorId = colorMap.get(colorKey);

    if (!profileId) {
      console.log(`  [error] Profile not found for key "${profileKey}"`);
      errors++;
      continue;
    }
    if (!colorId) {
      console.log(`  [error] Color not found for key "${colorKey}"`);
      errors++;
      continue;
    }

    const [existing] = await db
      .select()
      .from(tileProfileColor)
      .where(
        and(
          eq(tileProfileColor.profileId, profileId),
          eq(tileProfileColor.colorId, colorId),
        ),
      )
      .limit(1);

    if (!existing) {
      console.log(`  [error] No tile_profile_color row for "${key}"`);
      errors++;
      continue;
    }

    if (existing.imageUrl) {
      console.log(`  [skip] ${key} already has image_url`);
      skipped++;
      continue;
    }

    await db
      .update(tileProfileColor)
      .set({ imageUrl })
      .where(
        and(
          eq(tileProfileColor.profileId, profileId),
          eq(tileProfileColor.colorId, colorId),
        ),
      );
    console.log(`  [updated] ${key}`);
    updated++;
  }

  console.log(`\nDone. updated=${updated} skipped=${skipped} errors=${errors}`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
