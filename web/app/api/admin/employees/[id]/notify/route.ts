import { NextResponse } from "next/server";

/** Stub: reminder channel not wired — UI uses client mock store for optimistic updates. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ ok: true, id });
}
