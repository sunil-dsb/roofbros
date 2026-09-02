import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(
    __dirname,
    `../../${process.env.NODE_ENV || 'development'}.env`,
  ),
});

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { tileColor } from '../db/schema/tile.schema.ts';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const colors: { name: string; hexCode: string }[] = [
  { name: 'Sambuca', hexCode: '#171b1c' },
  { name: 'Barramundi', hexCode: '#292a27' },
  { name: 'Babylon', hexCode: '#716d65' },
  { name: 'Aniseed', hexCode: '#64533d' },
  { name: 'Wild Rice', hexCode: '#c7c2bc' },
  { name: 'Salt Spray', hexCode: '#dce1d6' },
  { name: 'Chilli', hexCode: '#5d2d1e' },
  { name: 'Mist Grey', hexCode: '#babbbb' },
  { name: 'Seashell', hexCode: '#e3dbce' },
  { name: 'Silver Perch', hexCode: '#9c988d' },
  { name: 'Caraway', hexCode: '#766857' },
  { name: 'Wollemi', hexCode: '#525346' },
  { name: 'Camelot', hexCode: '#343636' },
  { name: 'Soho Night', hexCode: '#424141' },
  { name: 'Saffron', hexCode: '#b04923' },
  { name: 'Titan Gloss', hexCode: '#373939' },
  { name: 'Peak', hexCode: '#4e5258' },
  { name: 'Mystic Grey', hexCode: '#5e6468' },
  { name: 'Comet', hexCode: '#848f99' },
  { name: 'Pottery Brown', hexCode: '#4d423f' },
  { name: 'Bedrock', hexCode: '#5e565b' },
  { name: 'Riverstone', hexCode: '#978d7e' },
  { name: 'Earth', hexCode: '#e7774e' },
  { name: 'Mars', hexCode: '#d5775e' },
  { name: 'Aurora', hexCode: '#d28c78' },
  { name: 'Tanbark', hexCode: '#925e53' },
  { name: 'Sunset', hexCode: '#a26454' },
  { name: 'Cottage Red', hexCode: '#86441e' },
  { name: 'Florence Red', hexCode: '#953c24' },
  { name: 'Titan', hexCode: '#373939' },
  { name: 'Ravine', hexCode: '#6a6c63' },
];

async function seed() {
  console.log('Seeding tile_color...\n');

  for (const { name, hexCode } of colors) {
    const [existing] = await db
      .select()
      .from(tileColor)
      .where(eq(tileColor.name, name))
      .limit(1);

    if (existing) {
      console.log(`  [skip] ${name} already exists`);
      continue;
    }

    await db.insert(tileColor).values({ name, hexCode });
    console.log(`  [inserted] ${name} (${hexCode})`);
  }

  console.log('\nDone.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
