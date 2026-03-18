// Migration: Add firstTimePlayed column to user_game_state
// Uses node-postgres (pg) instead of neon serverless
require("dotenv").config();
const { Client } = require("pg");

async function migrate() {
  const client = new Client({
    connectionString: process.env.neon_db_direct,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });
  
  await client.connect();
  console.log("Connected to database.");
  
  console.log("Adding firstTimePlayed column to user_game_state...");
  await client.query(`
    ALTER TABLE "user_game_state" 
    ADD COLUMN IF NOT EXISTS "firstTimePlayed" BOOLEAN DEFAULT true
  `);
  console.log("✓ Migration complete: firstTimePlayed column added.");
  
  await client.end();
}

migrate().catch(console.error);
