import { app } from './app.js';
import { config } from './config/env.js';
import { pool } from './config/database.js';

async function startServer() {
  try {
    // Verify database connectivity
    const client = await pool.connect();
    const versionRes = await client.query('SELECT version();');
    console.log('[PostgreSQL Connected]:', versionRes.rows[0].version.split(',')[0]);
    client.release();

    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 FreelanceHub Platform Server running on port ${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
}

startServer();
