import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    // Setup Neon HTTP connection
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(
      process.env.neon_db_direct || process.env.DATABASE_URL || ""
    );

    // Find existing user
    const users = await sql`SELECT * FROM "users" WHERE "email" = ${email}`;
    const user = users[0];

    if (!user) {
      // User doesn't exist, create them with the provided password
      await sql`
        INSERT INTO "users" ("email", "password", "created_at")
        VALUES (${email}, ${password}, NOW())
      `;
    } else {
      // User exists, check if password matches
      if (user.password !== password) {
        return NextResponse.json(
          { ok: false, error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Set session cookie — simple base64 encoded email (as it was before)
    const token = Buffer.from(email).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ ok: true, email });
  } catch (err: unknown) {
    console.error("login error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
