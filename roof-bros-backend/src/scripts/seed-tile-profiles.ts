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
import { tileProfile } from '../db/schema/tile.schema.ts';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const seedData: { tileTypeId: string; profiles: string[] }[] = [
  {
    tileTypeId: '00f382dd-6173-4d9a-a364-dfcbc51d6674',
    profiles: ['Atura', 'Cambridge', 'Elabana', 'Horizon', 'Madison', 'Tudor'],
  },
  {
    tileTypeId: 'e6319f7b-84fb-4175-9c27-0c09e0ff8b0a',
    profiles: ['Marseille', 'Nouveau', 'Urban Shingle'],
  },
];

async function seed() {
  console.log('Seeding tile_profile...');

  for (const { tileTypeId, profiles } of seedData) {
    console.log(`\n  tile_type_id: ${tileTypeId}`);

    for (const name of profiles) {
      const [existing] = await db
        .select()
        .from(tileProfile)
        .where(
          and(
            eq(tileProfile.name, name),
            eq(tileProfile.tileTypeId, tileTypeId),
          ),
        )
        .limit(1);

      if (existing) {
        console.log(`    [skip] ${name} already exists`);
        continue;
      }

      await db.insert(tileProfile).values({
        name,
        tileTypeId,
      });
      console.log(`    [inserted] ${name}`);
    }
  }

  console.log('\nDone.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
