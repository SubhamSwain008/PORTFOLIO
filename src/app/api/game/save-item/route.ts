import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper: get user ID from session cookie via Neon
async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const email = Buffer.from(token, "base64").toString("utf-8");
  if (!email || !email.includes("@")) return null;

  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.neon_db_direct || process.env.neon_db || "");
  const users = await sql`SELECT "id" FROM "users" WHERE "email" = ${email}`;
  return users[0]?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();
    if (!itemId || typeof quantity !== "number") {
      return NextResponse.json({ ok: false, error: "itemId and quantity required" }, { status: 400 });
    }

    const { neon } = require("@neondatabase/serverless");
    const sql = neon(process.env.neon_db_direct || process.env.neon_db || "");

    // Upsert: create game state if not exists, then update inventory
    await sql`
      INSERT INTO "user_game_state" ("userId", "inventory", "updatedAt")
      VALUES (${userId}, '[]'::jsonb, NOW())
      ON CONFLICT ("userId") DO NOTHING
    `;

    // Read current inventory
    const rows = await sql`SELECT "inventory" FROM "user_game_state" WHERE "userId" = ${userId}`;
    const currentInventory: { itemId: string; quantity: number }[] = rows[0]?.inventory || [];

    // Merge item
    const existing = currentInventory.find((i: { itemId: string }) => i.itemId === itemId);
    if (existing) {
      existing.quantity = quantity;
    } else {
      currentInventory.push({ itemId, quantity });
    }

    // Write back
    await sql`
      UPDATE "user_game_state"
      SET "inventory" = ${JSON.stringify(currentInventory)}::jsonb, "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("save-item error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
