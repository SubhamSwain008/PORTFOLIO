const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function main() {
  const sql = neon(process.env.neon_db_direct || process.env.neon_db);
  
  try {
    console.log("Adding hunger column...");
    await sql`
      ALTER TABLE user_game_state 
      ADD COLUMN IF NOT EXISTS "hunger" FLOAT NOT NULL DEFAULT 100
    `;
    console.log("Column added successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
