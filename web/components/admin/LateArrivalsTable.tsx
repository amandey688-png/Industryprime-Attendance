"use client";

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { LateRow } from "@/lib/admin/mockStore";
import { postNotifyLate } from "@/lib/api/admin";

function formatLateByMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0 && mm > 0) return `${h}h ${mm}m`;
  if (h > 0) return `${h}h`;
  return `${mm}m`;
}

export function LateArrivalsTable({
  rows,
  loading,
  lateTotalCount,
  isMasterAdmin,
  onDeleteEmployee,
}: {
  rows: LateRow[];
  loading: boolean;
  /** Total late today (may exceed visible rows). */
  lateTotalCount: number;
  isMasterAdmin: boolean;
  onDeleteEmployee?: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.department.toLowerCase().includes(s) ||
        r.employeeId.toLowerCase().includes(s) ||
        (r.employeeCode?.toLowerCase().includes(s) ?? false),
    );
  }, [rows, q]);

  async function notifyOne(employeeId: string) {
    try {
      const res = await postNotifyLate([employeeId]);
      toast.success(`Notified ${res.notified} employee(s)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Notify failed");
    }
  }

  if (!loading && filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm lg:col-span-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="text-sm font-semibold text-[#0F1F1B]">Late arrivals · today</h3>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-sm text-[#7A8784]">
          <CheckCircle2 className="h-10 w-10 text-[#10B981]" aria-hidden />
          <p className="font-medium text-[#0F1F1B]">Everyone&apos;s on time today</p>
          <p>No late check-ins match the current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm lg:col-span-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#0F1F1B]">Late arrivals · today</h3>
          {lateTotalCount > 0 ? (
            <Link
              href="/attendance"
              className="text-xs font-semibold text-[#10B981] hover:underline"
            >
              See all {lateTotalCount} →
            </Link>
          ) : null}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Quick search…"
          className="min-w-[160px] max-w-xs rounded-xl border border-[#E5EAE8] bg-[#F7FAF9] px-3 py-2 text-sm outline-none ring-[#10B981] focus:ring-2 sm:max-w-none sm:flex-1"
          aria-label="Search late arrivals"
        />
      </div>

      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#E5EAE8] text-left text-[11px] font-semibold uppercase tracking-wide text-[#7A8784]">
              <th className="py-2 pr-3">Employee</th>
              <th className="py-2 pr-3">Dept</th>
              <th className="py-2 pr-3">Check-in</th>
              <th className="py-2 pr-3">Late by</th>
              <th className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#7A8784]">
                  Loading…
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#E5EAE8]/80">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5EAE8] text-xs font-bold text-[#0F1F1B]">
                        {r.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-[#0F1F1B]">{r.name}</div>
                        <div className="text-xs text-[#7A8784]">{r.employeeCode ?? r.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-[#0F1F1B]">{r.department}</td>
                  <td className="py-3 pr-3 tabular-nums text-[#0F1F1B]">{r.checkIn}</td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/40 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {formatLateByMinutes(r.lateByMinutes)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void notifyOne(r.employeeId)}
                      className="text-xs font-semibold text-[#10B981] hover:underline"
                    >
                      Notify
                    </button>
                    {isMasterAdmin ? (
                      <>
                        <span className="mx-2 text-[#E5EAE8]" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#E04F4F] hover:underline"
                          onClick={() => onDeleteEmployee?.(r.employeeId)}
                        >
                          Remove
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E5EAE8] bg-[#F7FAF9] p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#0F1F1B]">{r.name}</p>
                <p className="text-xs text-[#7A8784]">{r.department}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/40 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                <Clock className="h-3 w-3" aria-hidden />
                {formatLateByMinutes(r.lateByMinutes)}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#7A8784]">
              Check-in {r.checkIn} · {r.employeeCode ?? r.employeeId}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="text-xs font-semibold text-[#10B981] underline"
                onClick={() => void notifyOne(r.employeeId)}
              >
                Notify
              </button>
              {isMasterAdmin ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#E04F4F]"
                  onClick={() => onDeleteEmployee?.(r.employeeId)}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
