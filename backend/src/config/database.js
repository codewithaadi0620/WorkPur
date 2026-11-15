import pkg from 'pg';
const { Pool } = pkg;
import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

// Prisma ORM Client for ORM operations
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

// PostgreSQL Connection Pool for advanced ADBMS features, stored procedures,
// complex analytical SQL, and strict concurrency control
export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client pool:', err);
});

/**
 * Execute parameterized raw SQL queries
 * @param {string} text - SQL statement with $1, $2 placeholders
 * @param {Array} params - Parameters array
 */
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development' && duration > 100) {
    console.log('Slow Query executed', { text: text.substring(0, 80), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Acquire client for explicit transaction boundaries
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}
