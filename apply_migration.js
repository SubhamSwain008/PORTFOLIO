const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.neon_db_direct });

pool.on('error', (err) => {
  console.error('Pool unexpected error:', err);
});

async function run() {
  try {
    const migrationSql = fs.readFileSync('migration.sql', 'utf8');
    console.log('Running migration globally via WS Pool...');
    
    const dropSql = `
      DROP TABLE IF EXISTS "inventory_items" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TYPE IF EXISTS "InventoryItemType" CASCADE;
    `;
    const result = await pool.query(dropSql + migrationSql);
    console.log('Migration completed successfully.');
  } catch (err) {
    if (err.type === 'error' && err.message === undefined) {
      console.error('Migration failed due to a transient network timeout/WebSocket error from your ISP. Please run `node apply_migration.js` again.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    await pool.end();
  }
}

run();
