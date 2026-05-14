import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { mockAuditEvents } from "@/lib/admin/mockStore";
import { requireMasterAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireMasterAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  return NextResponse.json({ events: mockAuditEvents() });
}
