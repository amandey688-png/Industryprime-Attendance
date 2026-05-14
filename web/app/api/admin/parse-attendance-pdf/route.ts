import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

/**
 * Stub PDF parse — accepts multipart file, returns mock extracted rows (no real parsing).
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const name = file instanceof File ? file.name : "upload.bin";
  const size = file instanceof File ? file.size : 0;

  return NextResponse.json({
    ok: true,
    fileName: name,
    bytes: size,
    status: "parsed_stub",
    rows: [
      { employeeCode: "EMP0001", date: "2026-05-14", inTime: "09:12", outTime: "18:05", confidence: 0.92 },
      { employeeCode: "EMP0002", date: "2026-05-14", inTime: "09:20", outTime: "18:10", confidence: 0.88 },
    ],
  });
}
