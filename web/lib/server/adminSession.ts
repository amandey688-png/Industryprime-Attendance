import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { AdminRole } from "@/lib/permissions";
import { isAdminRole, isMasterAdmin } from "@/lib/permissions";
import { serverBackendBase } from "@/lib/server/backendBase";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole | "user";
};

export async function getSessionUserFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const auth = req.headers.get("authorization");
  const bearer =
    auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const cookieToken = req.cookies.get("industryprime_token")?.value?.trim() ?? null;
  const token = bearer || cookieToken;
  if (!token) return null;

  const base = serverBackendBase();
  try {
    const res = await fetch(`${base}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { user?: SessionUser };
    const u = json.user;
    if (!u?.id || !u.role) return null;
    return u;
  } catch {
    return null;
  }
}

export async function requireAdminSession(
  req: NextRequest,
): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ detail: "Admin or Master Admin required" }, { status: 403 });
  }
  return { user };
}

export async function requireMasterAdminSession(
  req: NextRequest,
): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!isMasterAdmin(user.role)) {
    return NextResponse.json({ detail: "Master Admin required" }, { status: 403 });
  }
  return { user };
}
