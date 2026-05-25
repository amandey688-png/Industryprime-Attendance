"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ClipboardCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardTitle, Skeleton } from "@/components/ui/dashboard-ui";
import type { ApprovedLeaveRow } from "@/lib/api/admin";
import { useApprovedLeaves } from "@/lib/hooks/useAdminDashboard";

function monthLabel(year: number, month: number) {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

function fmtRange(from?: string | null, to?: string | null) {
  if (!from) return "—";
  try {
    const a = format(parseISO(from.slice(0, 10)), "MMM d");
    const b = to ? format(parseISO(to.slice(0, 10)), "MMM d") : a;
    return from.slice(0, 10) === (to || from).slice(0, 10) ? a : `${a} – ${b}`;
  } catch {
    return `${from} – ${to || from}`;
  }
}

function approverLabel(row: ApprovedLeaveRow) {
  return row.approved_by || row.decided_by_email || "—";
}

export function DashboardApproveLeaveCard() {
  const now = useMemo(() => new Date(), []);
  const yearOptions = useMemo(
    () => [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1],
    [now],
  );
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const q = useApprovedLeaves(year, month);

  const rows = q.data ?? [];

  return (
    <Card className="flex min-h-[320px] min-w-0 w-full flex-col lg:col-span-5">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ClipboardCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <CardTitle className="mb-0">Approve Leave</CardTitle>
            <p className="mt-0.5 text-xs text-[#7A8784]">Approved this month</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-[#E5EAE8] bg-white px-2 py-1.5 text-xs font-medium text-[#0F1F1B] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Month"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {format(new Date(2000, m - 1, 1), "MMMM")}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-[#E5EAE8] bg-white px-2 py-1.5 text-xs font-medium text-[#0F1F1B] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Year"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7A8784]">
        {monthLabel(year, month)} · {rows.length} approved
      </p>

      {q.isLoading ? (
        <div className="flex flex-1 flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : q.isError ? (
        <p className="text-sm text-rose-700">{q.error instanceof Error ? q.error.message : "Failed to load"}</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#F7FAF9] px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#0F1F1B]">No approved leave in this month</p>
          <p className="mt-1 text-xs text-[#7A8784]">Approvals will appear here after you decide requests.</p>
        </div>
      ) : (
        <ul className="max-h-[280px] flex-1 space-y-2 overflow-y-auto pr-1">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[#E5EAE8] bg-[#F7FAF9] px-3 py-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F1F1B]">
                    {row.employee_name || row.employee_code || "Employee"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#7A8784]">
                    {row.leave_type || "Leave"} · {fmtRange(row.leave_date_start, row.leave_date_end)}
                    {row.days != null && row.days > 0 ? ` · ${row.days}d` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                  Approved
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#7A8784]">By {approverLabel(row)}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-[#E5EAE8] pt-4">
        <Link
          href="/leave"
          className="text-xs font-semibold text-[#10B981] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Manage all leave requests →
        </Link>
      </div>
    </Card>
  );
}
