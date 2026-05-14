"use client";

import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AdminOverview } from "@/lib/api/admin";

export function TrendChart({
  trend,
  rangeDays,
  onRangeDays,
  loading,
}: {
  trend: AdminOverview["trend"] | null;
  rangeDays: 14 | 30;
  onRangeDays: (d: 14 | 30) => void;
  loading: boolean;
}) {
  const data =
    trend?.labels.map((label, i) => ({
      date: label,
      labelShort: (() => {
        try {
          return format(parseISO(label), "MMM d");
        } catch {
          return label;
        }
      })(),
      Present: trend.present[i] ?? 0,
      Absent: trend.absent[i] ?? 0,
      Late: trend.late[i] ?? 0,
    })) ?? [];

  return (
    <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm lg:col-span-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-[#0F1F1B]">Attendance trend</h3>
        <div className="flex flex-wrap gap-2">
          {([14, 30] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onRangeDays(d)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                rangeDays === d ? "bg-[#10B981] text-white" : "border border-[#E5EAE8] text-[#0F1F1B]"
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-72 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-[#7A8784]">Loading chart…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EAE8" />
              <XAxis dataKey="labelShort" tick={{ fontSize: 11, fill: "#7A8784" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7A8784" }} />
              <Tooltip />
              <Legend verticalAlign="top" height={28} />
              <Line type="monotone" dataKey="Present" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Absent" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Late" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
