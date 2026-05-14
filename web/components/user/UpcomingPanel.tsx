"use client";

import { format, parseISO } from "date-fns";
import { CalendarRange, Palmtree } from "lucide-react";
import Link from "next/link";

import type { MeHoliday, MeLeaveItem } from "@/lib/api/me";
import { LeaveRequestDialog } from "@/components/user/LeaveRequestDialog";

function chip(iso: string) {
  try {
    const d = parseISO(iso);
    return {
      m: format(d, "MMM").toUpperCase(),
      day: format(d, "d"),
    };
  } catch {
    return { m: "—", day: "—" };
  }
}

export function UpcomingPanel({
  holiday,
  leave,
}: {
  holiday: MeHoliday | null;
  leave: MeLeaveItem | null;
}) {
  return (
    <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#0F1F1B]">Upcoming</h2>
      <div className="mt-4 space-y-4">
        <div className="flex gap-3 rounded-xl border border-[#E5EAE8] bg-[#F7FAF9] p-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#3B82F6]/15 text-center">
            <span className="text-[10px] font-bold text-[#3B82F6]">{holiday ? chip(holiday.date).m : "—"}</span>
            <span className="text-lg font-bold leading-none text-[#0F1F1B]">{holiday ? chip(holiday.date).day : "—"}</span>
          </div>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B82F6]">
              <Palmtree className="h-3.5 w-3.5" aria-hidden />
              Next holiday
            </p>
            <p className="mt-1 font-semibold text-[#0F1F1B]">{holiday?.title ?? "No holiday scheduled"}</p>
            <p className="mt-0.5 text-xs text-[#7A8784]">{holiday?.subline ?? "—"}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-[#E5EAE8] bg-[#F7FAF9] p-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#10B981]/15 text-center">
            <span className="text-[10px] font-bold text-[#10B981]">{leave ? chip(leave.startDate).m : "—"}</span>
            <span className="text-lg font-bold leading-none text-[#0F1F1B]">{leave ? chip(leave.startDate).day : "—"}</span>
          </div>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
              <CalendarRange className="h-3.5 w-3.5" aria-hidden />
              Your next leave
            </p>
            <p className="mt-1 font-semibold text-[#0F1F1B]">{leave?.title ?? "No approved leave"}</p>
            <p className="mt-0.5 text-xs text-[#7A8784]">
              {leave ? `${leave.startDate} → ${leave.endDate} · ${leave.subline}` : "—"}
            </p>
            {leave ? <p className="mt-1 text-xs font-medium text-[#0F1F1B]">{leave.status}</p> : null}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <LeaveRequestDialog />
        <Link
          href="/leave"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#10B981] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
        >
          View calendar
        </Link>
      </div>
    </div>
  );
}
