import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { ok: false, error: "Email and OTP required" },
        { status: 400 }
      );
    }

    // Check OTP
    const verification = await prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!verification) {
      return NextResponse.json(
        { ok: false, error: "No pending OTP for this email" },
        { status: 400 }
      );
    }

    if (verification.otp !== otp) {
      return NextResponse.json(
        { ok: false, error: "Invalid OTP" },
        { status: 401 }
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { ok: false, error: "OTP has expired" },
        { status: 401 }
      );
    }

    // Delete the verification record to prevent reuse
    await prisma.otpVerification.delete({
      where: { email },
    });

    // Create user if they don't exist
    // Upsert doesn't let us easily just do nothing on update to avoid changing updatedAt if we had one.
    // Using findUnique then create is fine.
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          // password omitted since it is optional now, and we use OTP
        },
      });
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
