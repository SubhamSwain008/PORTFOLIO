const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function main() {
  const sql = neon(process.env.neon_db_direct || process.env.neon_db);
  
  try {
    // Check if column exists
    console.log("Adding currentWorld column...");
    await sql`
      ALTER TABLE user_game_state 
      ADD COLUMN IF NOT EXISTS "currentWorld" text NOT NULL DEFAULT 'night'
    `;
    console.log("Column added successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
