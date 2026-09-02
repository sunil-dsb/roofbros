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

const seedData: Record<string, string[]> = {
  Atura: [
    'Sambuca',
    'Barramundi',
    'Babylon',
    'Aniseed',
    'Wild Rice',
    'Salt Spray',
    'Chilli',
    'Mist Grey',
    'Seashell',
    'Silver Perch',
    'Caraway',
    'Wollemi',
    'Camelot',
  ],
  Cambridge: ['Soho Night'],
  Elabana: [
    'Sambuca',
    'Barramundi',
    'Babylon',
    'Aniseed',
    'Wild Rice',
    'Salt Spray',
    'Saffron',
    'Chilli',
    'Mist Grey',
    'Seashell',
  ],
  Horizon: [
    'Sambuca',
    'Barramundi',
    'Babylon',
    'Aniseed',
    'Wild Rice',
    'Salt Spray',
    'Mist Grey',
    'Seashell',
    'Silver Perch',
    'Caraway',
    'Wollemi',
    'Camelot',
  ],
  Madison: ['Soho Night'],
  Marseille: [
    'Titan Gloss',
    'Peak',
    'Mystic Grey',
    'Comet',
    'Pottery Brown',
    'Bedrock',
    'Riverstone',
    'Earth',
    'Mars',
    'Aurora',
    'Tanbark',
    'Sunset',
    'Cottage Red',
    'Florence Red',
  ],
  Nouveau: [
    'Titan',
    'Peak',
    'Comet',
    'Bedrock',
    'Riverstone',
    'Earth',
    'Mars',
    'Ravine',
  ],
  Tudor: ['Sambuca', 'Barramundi'],
  'Urban Shingle': ['Titan', 'Peak', 'Bedrock', 'Earth', 'Ravine'],
};

async function seed() {
  console.log('Seeding tile_profile_color...\n');

  // Preload all profiles and colors into lookup maps
  const allProfiles = await db.select().from(tileProfile);
  const allColors = await db.select().from(tileColor);

  const profileMap = new Map(allProfiles.map((p) => [p.name, p.id]));
  const colorMap = new Map(allColors.map((c) => [c.name, c.id]));

  for (const [profileName, colorNames] of Object.entries(seedData)) {
    const profileId = profileMap.get(profileName);
    if (!profileId) {
      console.log(`  [error] Profile "${profileName}" not found — skipping`);
      continue;
    }

    console.log(`  ${profileName}:`);

    for (const colorName of colorNames) {
      const colorId = colorMap.get(colorName);
      if (!colorId) {
        console.log(`    [error] Color "${colorName}" not found — skipping`);
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

      if (existing) {
        console.log(`    [skip] ${colorName} already linked`);
        continue;
      }

      await db.insert(tileProfileColor).values({
        profileId,
        colorId,
      });
      console.log(`    [linked] ${colorName}`);
    }
  }

  console.log('\nDone.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
