"use client";

import { getStoredToken, type AuthUser } from "@/lib/auth";

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const rel = path.startsWith("/") ? path : `/${path}`;
  const url = `/api/admin${rel}`;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = JSON.parse(text) as { detail?: string };
      if (typeof j.detail === "string") msg = j.detail;
    } catch {
      if (text) msg = text.slice(0, 200);
    }
    throw new Error(msg);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export type AdminOverview = {
  refreshedAt: string;
  role: AuthUser["role"];
  kpis: {
    totalEmployees: number;
    joinDeltaMonth: number;
    presentToday: number;
    presentTotal: number;
    absentUnplanned: number;
    absentOnLeave: number;
    lateToday: number;
    lateDeltaVsYesterday: number;
    onApprovedLeave: number;
    pendingLeaveCount: number;
  };
  trend: {
    labels: string[];
    present: number[];
    absent: number[];
    late: number[];
  };
  departmentPresence: { name: string; present: number }[];
  lateRows: import("@/lib/admin/mockStore").LateRow[];
  pendingLeaves: import("@/lib/admin/mockStore").PendingLeave[];
};

export async function fetchAdminOverview(query: {
  department?: string | null;
  days?: number;
}): Promise<AdminOverview> {
  const sp = new URLSearchParams();
  if (query.department) sp.set("department", query.department);
  if (query.days) sp.set("days", String(query.days));
  const q = sp.toString();
  return adminFetch<AdminOverview>(`/overview${q ? `?${q}` : ""}`);
}

export async function fetchAdminAudit(): Promise<{ events: import("@/lib/admin/mockStore").AuditEvent[] }> {
  return adminFetch("/audit");
}

export async function postLeaveDecision(id: string, action: "approve" | "reject"): Promise<void> {
  await adminFetch(`/leaves/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export async function putLeaveRevert(id: string): Promise<void> {
  await adminFetch(`/leaves/${id}/decision`, {
    method: "PUT",
  });
}

export async function postNotifyLate(employeeIds: string[]): Promise<{ notified: number }> {
  return adminFetch<{ notified: number }>("/notify-late", {
    method: "POST",
    body: JSON.stringify({ employeeIds }),
  });
}

export async function postParseAttendancePdf(file: File): Promise<{
  ok: boolean;
  fileName: string;
  bytes: number;
  status: string;
  rows: { employeeCode: string; date: string; inTime: string; outTime: string; confidence: number }[];
}> {
  const token = getStoredToken();
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/admin/parse-attendance-pdf", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  return JSON.parse(text) as Awaited<ReturnType<typeof postParseAttendancePdf>>;
}

export function buildExportReportUrl(params: { format: string; from: string; to: string }): string {
  const sp = new URLSearchParams({ format: params.format, from: params.from, to: params.to });
  return `/api/admin/export-report?${sp.toString()}`;
}

export function useAdminOverviewQueryKey(args: { department: string | null; days: number }) {
  return ["admin-overview", args.department, args.days] as const;
}

/** Dashboard (`/`) overview mocks — swap implementations for real fetches later. */
export type {
  AuditEvent,
  DashboardRole,
  DeptSlice,
  KpiSnapshot,
  LateArrival,
  LeaveRequest,
  TrendPoint,
} from "@/lib/admin/dashboardMockStore";

export {
  buildTrend,
  decideLeave,
  getAudit,
  getDepartments,
  getKpis,
  getLateArrivals,
  getPendingLeaves,
  getTrend,
  notifyEmployee,
  notifyEmployees,
  restoreLastLeave,
} from "@/lib/admin/dashboardMockStore";
