import { defineConfig } from 'drizzle-kit';
import config from './src/config/index.ts';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.databaseUrl,
  },
});
