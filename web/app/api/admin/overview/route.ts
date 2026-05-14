import { subDays, format } from "date-fns";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminMockStore, mockLateRows } from "@/lib/admin/mockStore";
import { requireAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireAdminSession(req);
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const days = Math.min(Number(searchParams.get("days") || "14") || 14, 90);

  const today = new Date();
  const trendDays: string[] = [];
  const present: number[] = [];
  const absent: number[] = [];
  const late: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    trendDays.push(format(d, "yyyy-MM-dd"));
    const u = 1 - i / Math.max(days - 1, 1);
    present.push(Math.round(98 + 10 * u + 6 * Math.sin(u * Math.PI * 2.1)));
    absent.push(Math.round(11 - 3 * u + 2 * Math.cos(u * Math.PI * 1.7)));
    late.push(Math.round(8 + 4 * u + 2 * Math.sin(u * Math.PI * 2.5)));
  }
  if (present.length) {
    present[present.length - 1] = 108;
    absent[absent.length - 1] = 9;
    late[late.length - 1] = 12;
  }

  const store = getAdminMockStore();
  const lateRows = mockLateRows(department);

  const departmentPresence = [
    { name: "Sales", present: 52 },
    { name: "Engineering", present: 34 },
    { name: "Operations", present: 19 },
    { name: "HR / Admin", present: 11 },
  ];

  const body = {
    refreshedAt: new Date().toISOString(),
    role: gate.user.role,
    kpis: {
      totalEmployees: 126,
      joinDeltaMonth: 4,
      presentToday: 108,
      presentTotal: 126,
      absentUnplanned: 3,
      absentOnLeave: 6,
      lateToday: 12,
      lateDeltaVsYesterday: 5,
      onApprovedLeave: 6,
      pendingLeaveCount: store.pendingLeaves.length,
    },
    trend: {
      labels: trendDays,
      present,
      absent,
      late,
    },
    departmentPresence,
    lateRows,
    pendingLeaves: store.pendingLeaves,
  };

  return NextResponse.json(body);
}
