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

export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZIp8aCD5sPdk@ep-quiet-scene-aitufoy0-pooler.c-4.us-east-1.aws.neon.tech:443/neondb?sslmode=require");

        const saves = await sql`SELECT * FROM game_saves WHERE "userId" = ${userId} ORDER BY created_at DESC`;

        return NextResponse.json({ ok: true, saves });
    } catch (error) {
        console.error("Error fetching saves:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { neon } = require('@neondatabase/serverless');
        const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZIp8aCD5sPdk@ep-quiet-scene-aitufoy0-pooler.c-4.us-east-1.aws.neon.tech:443/neondb?sslmode=require");

        const body = await request.json();
        const { health = 100, hunger = 100, inventory = [] } = body;
        
        // Serialize inventory properly for JSONB
        const inventoryJson = JSON.stringify(inventory);

        const newSave = await sql`
            INSERT INTO game_saves ("userId", health, hunger, inventory)
            VALUES (${userId}, ${health}, ${hunger}, ${inventoryJson}::jsonb)
            RETURNING *
        `;

        return NextResponse.json({ ok: true, save: newSave[0] });
    } catch (error) {
        console.error("Error creating save:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
