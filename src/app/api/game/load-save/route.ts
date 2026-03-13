import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const email = Buffer.from(token, "base64").toString("utf-8");
  if (!email || !email.includes("@")) return null;

  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZIp8aCD5sPdk@ep-quiet-scene-aitufoy0-pooler.c-4.us-east-1.aws.neon.tech:443/neondb?sslmode=require");
  const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
  return users[0]?.id ?? null;
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZIp8aCD5sPdk@ep-quiet-scene-aitufoy0-pooler.c-4.us-east-1.aws.neon.tech:443/neondb?sslmode=require");

        const body = await request.json();
        const { saveId } = body;

        if (!saveId) {
            return NextResponse.json({ error: "saveId is required" }, { status: 400 });
        }

        const saves = await sql`
            SELECT * FROM game_saves WHERE id = ${saveId}
        `;

        const save = saves[0];

        if (!save || save.userId !== userId) {
            return NextResponse.json({ error: "Save not found or unauthorized" }, { status: 404 });
        }

        // --- Overwrite active game state with the loaded save data ---
        let parsedInv = [];
        if (typeof save.inventory === "string") {
            try { parsedInv = JSON.parse(save.inventory); } catch(e) {}
        } else if (Array.isArray(save.inventory)) {
            parsedInv = save.inventory;
        }

        await sql`
            UPDATE "user_game_state"
            SET
                "inventory" = ${JSON.stringify(parsedInv)}::jsonb,
                "hunger" = ${save.hunger ?? 100},
                "health" = ${save.health ?? 100},
                "updatedAt" = NOW()
            WHERE "userId" = ${userId}
        `;

        return NextResponse.json({ ok: true, save });
    } catch (error) {
        console.error("Error loading save:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
