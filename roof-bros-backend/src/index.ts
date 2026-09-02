import app from './app.ts';
import config from './config/index.ts';
import { pool } from './config/db.ts';

app.listen(config.port, () => {
  console.log(`⚙️  Server is running at port : ${config.port}`);
  pool
    .query('SELECT 1')
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err);
      process.exit(1);
    });
});
