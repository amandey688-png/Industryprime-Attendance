"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminDashboardNav } from "@/components/admin/AdminDashboardNav";
import { DepartmentDonut } from "@/components/admin/DepartmentDonut";
import { FloatingRefresh } from "@/components/admin/FloatingRefresh";
import { KpiRow } from "@/components/admin/KpiRow";
import { LateArrivalsTable } from "@/components/admin/LateArrivalsTable";
import { PendingApprovals } from "@/components/admin/PendingApprovals";
import { RoleGuard, UnauthorizedView } from "@/components/admin/RoleGuard";
import { TopActions } from "@/components/admin/TopActions";
import { TrendChart } from "@/components/admin/TrendChart";
import { useAdminOverview } from "@/lib/hooks/useAdminOverview";
import { useSession } from "@/lib/hooks/useSession";

const roleBadge: Record<string, string> = {
  master_admin: "Master Admin",
  admin: "Admin",
};

export default function AdminDashboardPage() {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const qc = useQueryClient();

  const department = sp.get("department");

  const [rangeDays, setRangeDays] = useState<14 | 30>(14);

  const overviewArgs = useMemo(
    () => ({ department: department || null, days: rangeDays }),
    [department, rangeDays],
  );

  const q = useAdminOverview(overviewArgs);

  const setDepartment = useCallback(
    (name: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (name) next.set("department", name);
      else next.delete("department");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, sp],
  );

  const isMaster = user?.role === "master_admin";
  const pendingLeaveCount = q.data?.pendingLeaves?.length ?? q.data?.kpis?.pendingLeaveCount ?? 0;

  const lastIso = q.data?.refreshedAt ?? null;

  const onExportPayroll = useCallback(() => {
    toast.message("Opening payroll workspace…");
    window.open("/payroll", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <RoleGuard allow={["admin", "master_admin"]} role={user?.role} fallback={<UnauthorizedView />}>
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#F7FAF9] text-[#0F1F1B]">
        <AdminDashboardNav pendingLeaveCount={pendingLeaveCount} isMasterAdmin={isMaster} />

        <div className="min-w-0 flex-1 pb-24">
          <TopActions isMasterAdmin={isMaster} onExportPayroll={onExportPayroll} />

          <div className="mx-auto max-w-[1400px] px-3 pt-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-6">
              <header className="lg:col-span-12">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F1F1B]">Attendance Overview</h1>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-[#374151]">
                      {q.isFetching ? (
                        <span className="inline-flex items-center gap-1 text-[#10B981]">
                          <Activity className="h-3.5 w-3.5 animate-pulse" aria-hidden />
                          Refreshing…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#10B981]">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                          </span>
                          Live data
                        </span>
                      )}
                      <span aria-hidden> · </span>
                      Last refreshed{" "}
                      <span className="font-bold tabular-nums text-[#0F1F1B]">
                        {lastIso
                          ? new Date(lastIso).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "—"}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {user?.role ? (roleBadge[user.role] ?? user.role) : "—"}
                  </span>
                </div>
              </header>

              {q.isError ? (
                <div
                  className="rounded-2xl border border-[#E04F4F]/40 bg-red-50 px-4 py-3 text-sm text-red-900 lg:col-span-12"
                  role="alert"
                >
                  <strong className="font-semibold">Panel error.</strong> {q.error.message} — ensure you are signed in as
                  Admin and the API can reach <code className="font-mono">/auth/me</code>.
                  <button
                    type="button"
                    className="ml-2 font-semibold text-[#10B981] underline"
                    onClick={() => void q.refetch()}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div className="lg:col-span-12">
                <KpiRow kpis={q.data?.kpis ?? null} loading={q.isLoading} />
              </div>

              <div className="contents lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-6">
                <TrendChart
                  trend={q.data?.trend ?? null}
                  rangeDays={rangeDays}
                  onRangeDays={setRangeDays}
                  loading={q.isLoading}
                />
                <DepartmentDonut
                  data={q.data?.departmentPresence ?? null}
                  selectedDept={department}
                  onSelectDept={setDepartment}
                  loading={q.isLoading}
                />
              </div>

              <div className="contents lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-6">
                <LateArrivalsTable
                  rows={q.data?.lateRows ?? []}
                  loading={q.isLoading}
                  lateTotalCount={q.data?.kpis?.lateToday ?? 0}
                  isMasterAdmin={isMaster}
                  onDeleteEmployee={(id) =>
                    toast.message(`Delete employee stub — id ${id} (Master Admin only action)`)
                  }
                />
                <PendingApprovals leaves={q.data?.pendingLeaves ?? []} filterArgs={overviewArgs} />
              </div>
            </div>
          </div>

          <FloatingRefresh
            lastUpdatedIso={lastIso}
            onRefresh={() => {
              void qc.invalidateQueries({ queryKey: ["admin-overview"] });
              void q.refetch();
            }}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
