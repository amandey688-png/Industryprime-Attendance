import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { forwardToBackend } from "@/lib/server/forwardToBackend";
import { requireUserSession } from "@/lib/server/userSession";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireUserSession(req);
  if (gate instanceof NextResponse) return gate;
  return forwardToBackend(req, "/me/profile");
}
