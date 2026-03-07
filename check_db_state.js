const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({ connectionString: process.env.neon_db_direct });

async function run() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
    console.log('Tables in public schema:');
    console.table(res.rows);
    
    // check if _prisma_migrations exists
    if (res.rows.find(r => r.table_name === '_prisma_migrations')) {
      const mig = await pool.query("SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;");
      console.log('Recent migrations:');
      console.table(mig.rows);
    }
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await pool.end();
  }
}

run();
