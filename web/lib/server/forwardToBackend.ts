import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { serverBackendBase } from "@/lib/server/backendBase";

/** Forward Authorization (Bearer) from the browser to FastAPI. */
export async function forwardToBackend(
  req: NextRequest,
  path: string,
  init?: RequestInit,
): Promise<NextResponse> {
  const base = serverBackendBase();
  const auth = req.headers.get("authorization");
  const headers = new Headers(init?.headers);
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  const out = new NextResponse(text, { status: res.status });
  const ct = res.headers.get("content-type");
  if (ct) out.headers.set("content-type", ct);
  return out;
}
