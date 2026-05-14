import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

type Body = { employeeIds: string[] };

export async function POST(req: NextRequest) {
  const gate = await requireAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }
  const ids = Array.isArray(body.employeeIds) ? body.employeeIds.filter((x) => typeof x === "string") : [];
  return NextResponse.json({ ok: true, notified: ids.length, employeeIds: ids });
}
