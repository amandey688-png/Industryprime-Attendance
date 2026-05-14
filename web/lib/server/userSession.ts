import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionUserFromRequest, type SessionUser } from "@/lib/server/adminSession";

export async function requireUserSession(
  req: NextRequest,
): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "user") {
    return NextResponse.json({ detail: "This endpoint is only for employee accounts." }, { status: 403 });
  }
  return { user };
}
