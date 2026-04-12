const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(
    "postgresql://neondb_owner:npg_ZIp8aCD5sPdk@ep-quiet-scene-aitufoy0.c-4.us-east-1.aws.neon.tech:443/neondb?sslmode=require&connect_timeout=30"
  );

  console.log("Adding story columns to user_game_state...");

  await sql`
    ALTER TABLE "user_game_state"
      ADD COLUMN IF NOT EXISTS "currentChapter" INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "storyConversations" JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS "chapterCompleted" JSONB DEFAULT '[]'::jsonb
  `;

  console.log("✅ Columns added successfully!");

  // Verify
  const rows = await sql`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'user_game_state'
      AND column_name IN ('currentChapter', 'storyConversations', 'chapterCompleted')
    ORDER BY column_name
  `;
  console.log("Verified columns:", rows);
}

main().catch(console.error);
