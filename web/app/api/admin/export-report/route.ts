import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

/** Stub stream: CSV for all formats (XLSX/PDF requested → still CSV demo bytes). */
export async function GET(req: NextRequest) {
  const gate = await requireAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "csv").toLowerCase();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const header = `IndustryPrime export (${format.toUpperCase()})\nfrom,${from}\nto,${to}\n`;
  const rows = "employee_id,name,department,status\nstub-1,Sample User,Engineering,present\n";
  const csv = header + rows;

  const name = `attendance-export-${from || "start"}-${to || "end"}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
