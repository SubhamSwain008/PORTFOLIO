import { NextResponse } from "next/server";

// Minimal ping endpoint — no DB, no cookies, no heavy work.
// Used by the client NetworkMonitor to measure round-trip latency.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}
