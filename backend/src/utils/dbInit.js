import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, '../../database');

export async function runSqlFile(filename) {
  const filePath = path.join(dbDir, filename);
  console.log(`[DB Init] Executing: ${filename}...`);
  const sql = await fs.readFile(filePath, 'utf-8');
  await pool.query(sql);
  console.log(`[DB Init] Completed: ${filename}`);
}

export async function initializeDatabase({ seed = true } = {}) {
  try {
    console.log('--- Starting Database Initialization ---');
    await runSqlFile('schema.sql');
    await runSqlFile('procedures.sql');
    await runSqlFile('functions.sql');
    await runSqlFile('triggers.sql');
    await runSqlFile('views.sql');
    await runSqlFile('materialized_views.sql');
    await runSqlFile('indexes.sql');

    if (seed) {
      await runSqlFile('seed.sql');
      // Refresh materialized views with seeded data
      await pool.query('CALL refresh_all_materialized_views();');
      console.log('[DB Init] Materialized views refreshed.');
    }

    console.log('--- Database Initialization Successful ---');
  } catch (error) {
    console.error('[DB Init Error]:', error);
    throw error;
  }
}

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('dbInit.js')) {
  initializeDatabase({ seed: true })
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
