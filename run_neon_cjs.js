require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function run() {
  try {
    const url = process.env.neon_db_direct || process.env.neon_db;
    if (!url) {
      console.error("Missing DB URL in .env");
      process.exit(1);
    }
    const sql = neon(url);
    console.log("Adding firstTimePlayed column...");
    await sql`
      ALTER TABLE "user_game_state"
      ADD COLUMN IF NOT EXISTS "firstTimePlayed" BOOLEAN DEFAULT true;
    `;
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
