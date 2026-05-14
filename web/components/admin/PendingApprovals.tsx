"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

import type { PendingLeave } from "@/lib/admin/mockStore";
import { postLeaveDecision, putLeaveRevert, useAdminOverviewQueryKey } from "@/lib/api/admin";

function formatLeaveRange(startDate: string, endDate: string): string {
  try {
    const a = parseISO(startDate);
    const b = parseISO(endDate);
    return `${format(a, "MMM d")} – ${format(b, "MMM d")}`;
  } catch {
    return `${startDate} – ${endDate}`;
  }
}

export function PendingApprovals({
  leaves,
  filterArgs,
}: {
  leaves: PendingLeave[];
  filterArgs: { department: string | null; days: number };
}) {
  const qc = useQueryClient();
  const key = useAdminOverviewQueryKey(filterArgs);

  const decision = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) => {
      await postLeaveDecision(id, action);
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: key });
      toast.success(vars.action === "approve" ? "Leave approved" : "Leave rejected", {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await putLeaveRevert(vars.id);
              await qc.invalidateQueries({ queryKey: key });
              toast.message("Approval reverted");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Undo failed");
            }
          },
        },
      });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Request failed");
    },
  });

  if (!leaves.length) {
    return (
      <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#0F1F1B]">Pending leave approvals</h3>
        </div>
        <div className="mt-8 flex flex-col items-center text-center text-sm text-[#7A8784]">
          <span className="text-3xl" aria-hidden>
            🎉
          </span>
          <p className="mt-2 font-medium text-[#0F1F1B]">No pending approvals</p>
          <p className="mt-1">You&apos;re all caught up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm lg:col-span-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0F1F1B]">Pending leave approvals</h3>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#E04F4F] px-2 text-[11px] font-bold text-white">
          {leaves.length > 99 ? "99+" : leaves.length}
        </span>
      </div>
      <div className="mt-4 flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
        {leaves.map((lv) => (
          <div key={lv.id} className="rounded-xl border border-[#E5EAE8] bg-[#F7FAF9] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0F1F1B] shadow-sm">
                {lv.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#0F1F1B]">{lv.name}</p>
                <p className="text-xs text-[#7A8784]">{lv.department}</p>
                <p className="mt-2 inline-flex flex-wrap items-center gap-1 text-xs font-medium text-[#0F1F1B]">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#3B82F6]" aria-hidden />
                  <span>
                    {lv.leaveType} · {formatLeaveRange(lv.startDate, lv.endDate)} ({lv.days}{" "}
                    {lv.days === 1 ? "day" : "days"})
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#7A8784]">
                  <span className="font-medium text-[#0F1F1B]/80">Reason:</span> {lv.reason}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={decision.isPending}
                    onClick={() => decision.mutate({ id: lv.id, action: "approve" })}
                    className="rounded-xl bg-[#10B981] px-3 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={decision.isPending}
                    onClick={() => decision.mutate({ id: lv.id, action: "reject" })}
                    className="rounded-xl border border-[#E5EAE8] bg-white px-3 py-2 text-xs font-semibold text-[#0F1F1B] shadow-sm disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
