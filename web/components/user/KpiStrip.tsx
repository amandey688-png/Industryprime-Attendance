"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import type { MeKpis } from "@/lib/api/me";

function Delta({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-[#10B981]" : "text-[#E04F4F]"}`}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
      {up ? "+" : ""}
      {v}
    </span>
  );
}

export function KpiStrip({ kpis, loading }: { kpis: MeKpis | null; loading: boolean }) {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:col-span-5 lg:grid-cols-1 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#E5EAE8]/80" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Present this month",
      value: `${kpis.presentThisMonth.current} / ${kpis.presentThisMonth.total}`,
      sub: <>On track this period</>,
    },
    {
      label: "Late arrivals",
      value: String(kpis.lateArrivals.count),
      sub: (
        <>
          vs prev month <Delta v={kpis.lateArrivals.deltaVsPrevMonth} />
        </>
      ),
    },
    {
      label: "Leave balance",
      value: `${Math.max(0, kpis.leaveBalance.total - kpis.leaveBalance.used).toFixed(1)} left`,
      sub: (
        <>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5EAE8]">
            <div
              className="h-full rounded-full bg-[#10B981]"
              style={{
                width: `${Math.min(
                  100,
                  kpis.leaveBalance.total > 0
                    ? ((kpis.leaveBalance.total - kpis.leaveBalance.used) / kpis.leaveBalance.total) * 100
                    : 0,
                )}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[#7A8784]">{kpis.leaveBalance.breakdown}</p>
        </>
      ),
    },
    {
      label: "Avg hours / day",
      value: kpis.avgHoursPerDay.value.toFixed(1),
      sub: (
        <>
          {kpis.avgHoursPerDay.deltaVsTarget >= 0 ? "Above" : "Below"} target{" "}
          <Delta v={Math.round(kpis.avgHoursPerDay.deltaVsTarget * 10) / 10} />
        </>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:col-span-5 lg:grid-cols-1 lg:gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A8784]">{c.label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tabular-nums text-[#0F1F1B]">{c.value}</p>
          <div className="mt-2 text-xs text-[#7A8784]">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
