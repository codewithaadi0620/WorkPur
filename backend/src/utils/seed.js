import { runSqlFile, initializeDatabase } from './dbInit.js';
import { pool } from '../config/database.js';

async function seed() {
  try {
    console.log('Seeding database with realistic sample records...');
    await runSqlFile('seed.sql');
    await pool.query('CALL refresh_all_materialized_views();');
    console.log('Seeding and materialized view refresh completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
