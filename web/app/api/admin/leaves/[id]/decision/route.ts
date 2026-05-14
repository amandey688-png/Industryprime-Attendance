import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { removePendingLeave, restoreLastRemovedLeave } from "@/lib/admin/mockStore";
import { requireAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

type Body = { action: "approve" | "reject" };

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ detail: "action must be approve or reject" }, { status: 400 });
  }

  const removed = removePendingLeave(id);
  if (!removed) {
    return NextResponse.json({ detail: "Leave request not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, action: body.action, leave: removed });
}

/** Undo toast — restores stub pending row for mock store. */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  const restored = restoreLastRemovedLeave(id);
  if (!restored) {
    return NextResponse.json({ detail: "Nothing to revert" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, leave: restored });
}
