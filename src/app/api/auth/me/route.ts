import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const email = Buffer.from(token, "base64").toString("utf-8");
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    // Setup Neon HTTP connection to bypass TCP block
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.neon_db_direct || process.env.DATABASE_URL || "");

    const users = await sql`SELECT * FROM "users" WHERE "email" = ${email}`;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }
}
