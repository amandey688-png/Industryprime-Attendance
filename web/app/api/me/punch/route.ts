import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireUserSession } from "@/lib/server/userSession";

export const dynamic = "force-dynamic";

/** Check-in/out from the web UI was removed; attendance is sourced from Supabase / device / admin entry. */
export async function POST(req: NextRequest) {
  const gate = await requireUserSession(req);
  if (gate instanceof NextResponse) return gate;
  void req;
  return NextResponse.json(
    {
      detail:
        "Punch from this app is disabled. Your times come from attendance records in the database (admin upload, device, or attendance entry).",
    },
    { status: 410 },
  );
}
