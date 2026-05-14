"use client";

import type { AdminOverview } from "@/lib/api/admin";

const card =
  "rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm";

export function KpiRow({ kpis, loading }: { kpis: AdminOverview["kpis"] | null; loading: boolean }) {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`${card} animate-pulse`}>
            <div className="h-3 w-24 rounded bg-[#E5EAE8]" />
            <div className="mt-4 h-8 w-16 rounded bg-[#E5EAE8]" />
            <div className="mt-2 h-3 w-32 rounded bg-[#E5EAE8]" />
          </div>
        ))}
      </div>
    );
  }

  const presentPct = kpis.presentTotal ? Math.round((kpis.presentToday / kpis.presentTotal) * 100) : 0;

  const items: {
    label: string;
    value: string;
    sub: string;
    subAccent?: string;
    accent?: string;
  }[] = [
    {
      label: "Total employees",
      value: kpis.totalEmployees.toLocaleString(),
      sub: `+${kpis.joinDeltaMonth} this month`,
      subAccent: "text-[#10B981]",
    },
    {
      label: "Present today",
      value: `${kpis.presentToday} / ${kpis.presentTotal}`,
      sub: "",
    },
    {
      label: "Absent",
      value: String(kpis.absentUnplanned + kpis.absentOnLeave),
      sub: `${kpis.absentUnplanned} unplanned · ${kpis.absentOnLeave} on leave`,
    },
    {
      label: "Late arrivals",
      value: String(kpis.lateToday),
      sub:
        kpis.lateDeltaVsYesterday === 0
          ? "Same as yesterday"
          : `${kpis.lateDeltaVsYesterday > 0 ? "+" : "−"}${Math.abs(kpis.lateDeltaVsYesterday)} vs yesterday`,
      accent: kpis.lateDeltaVsYesterday > 0 ? "text-[#E04F4F]" : "text-[#7A8784]",
    },
    {
      label: "On approved leave",
      value: String(kpis.onApprovedLeave),
      sub: `${kpis.pendingLeaveCount} pending requests`,
    },
  ];

  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
      {items.map((k) => (
        <div key={k.label} className={`${card} min-w-[200px] shrink-0 snap-start lg:min-w-0`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7A8784]">{k.label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-[#0F1F1B]">{k.value}</p>
          {k.sub ? (
            <p className={`mt-1 text-xs ${k.subAccent ?? k.accent ?? "text-[#7A8784]"}`}>{k.sub}</p>
          ) : null}
          {k.label === "Present today" ? (
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5EAE8]"
              role="progressbar"
              aria-valuenow={presentPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Present percentage"
            >
              <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${presentPct}%` }} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
