import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    const sql = neon(process.env.neon_db_direct || process.env.neon_db);
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
