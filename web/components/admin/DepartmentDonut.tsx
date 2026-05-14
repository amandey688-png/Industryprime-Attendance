"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { AdminOverview } from "@/lib/api/admin";

const FALLBACK = ["#10B981", "#3B82F6", "#F59E0B", "#A855F7", "#06B6D4"];

const DEPT_FILL: Record<string, string> = {
  Sales: "#10B981",
  Engineering: "#3B82F6",
  Operations: "#F59E0B",
  "HR / Admin": "#A855F7",
};

function fillFor(name: string, i: number): string {
  return DEPT_FILL[name] ?? FALLBACK[i % FALLBACK.length]!;
}

export function DepartmentDonut({
  data,
  selectedDept,
  onSelectDept,
  loading,
}: {
  data: AdminOverview["departmentPresence"] | null;
  selectedDept: string | null;
  onSelectDept: (name: string | null) => void;
  loading: boolean;
}) {
  const total = useMemo(() => data?.reduce((s, d) => s + d.present, 0) ?? 0, [data]);
  const chartData =
    data?.map((d, i) => ({
      name: d.name,
      value: d.present,
      fill: fillFor(d.name, i),
    })) ?? [];

  return (
    <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm lg:col-span-5">
      <h3 className="text-sm font-semibold text-[#0F1F1B]">Department breakdown</h3>
      <p className="mt-1 text-xs text-[#7A8784]">Click a slice to filter late arrivals.</p>
      <div className="mt-4 hidden lg:block">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative h-56 w-full min-w-[220px] flex-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-[#7A8784]">Loading…</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={80}
                      paddingAngle={2}
                      onClick={(_, index) => {
                        const name = chartData[index]?.name;
                        if (!name) return;
                        onSelectDept(selectedDept === name ? null : name);
                      }}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.fill}
                          opacity={selectedDept && selectedDept !== entry.name ? 0.35 : 1}
                          className="cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold tabular-nums leading-none text-[#0F1F1B]">{total}</p>
                  <p className="mt-1 text-xs font-medium text-[#7A8784]">Present</p>
                </div>
              </>
            )}
          </div>
          <div className="hidden flex-1 flex-col justify-center gap-2 text-sm lg:flex">
            {chartData.map((row) => (
              <button
                key={row.name}
                type="button"
                onClick={() => onSelectDept(selectedDept === row.name ? null : row.name)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                  selectedDept === row.name
                    ? "border-[#10B981] bg-emerald-50"
                    : "border-[#E5EAE8] bg-[#F7FAF9] hover:border-[#10B981]/50"
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-[#0F1F1B]">
                  <span className="h-2 w-2 rounded-full" style={{ background: row.fill }} aria-hidden />
                  {row.name}
                </span>
                <span className="tabular-nums text-[#7A8784]">{row.value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <DepartmentBarsMobile data={data} selectedDept={selectedDept} onSelectDept={onSelectDept} />
      </div>
    </div>
  );
}

/** Mobile-friendly horizontal bar alternative */
export function DepartmentBarsMobile({
  data,
  selectedDept,
  onSelectDept,
}: {
  data: AdminOverview["departmentPresence"] | null;
  selectedDept: string | null;
  onSelectDept: (name: string | null) => void;
}) {
  const max = Math.max(1, ...(data?.map((d) => d.present) ?? [1]));
  return (
    <div className="mt-4 space-y-2 lg:hidden">
      {data?.map((d, i) => (
        <button
          key={d.name}
          type="button"
          onClick={() => onSelectDept(selectedDept === d.name ? null : d.name)}
          className="block w-full text-left"
        >
          <div className="flex justify-between text-xs font-medium text-[#0F1F1B]">
            <span>{d.name}</span>
            <span>{d.present}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E5EAE8]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.present / max) * 100}%`,
                background: fillFor(d.name, i),
                opacity: selectedDept && selectedDept !== d.name ? 0.35 : 1,
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
