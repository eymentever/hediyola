import { NextResponse } from 'next/server';

/** Lightweight health check for uptime monitoring / deploy smoke tests. */
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'hediyola-web', ts: Date.now() });
}
