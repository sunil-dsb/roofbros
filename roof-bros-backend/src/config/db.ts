// src/config/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import config from '../config/index.ts';
import * as schema from '../db/schema/index.ts';

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

// The schema has to be registered here as well — better-auth's drizzle adapter
// resolves tables through `db._.fullSchema` / `db.query`.
export const db = drizzle(pool, { schema });
