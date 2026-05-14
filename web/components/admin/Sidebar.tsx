"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

import { Sheet } from "@/components/ui/dashboard-ui";
import { useDashboardAdminNav } from "@/components/dashboard/DashboardAdminNavContext";
import { cn } from "@/lib/cn";
import { can } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";

const items: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: "leave";
  masterOnly?: boolean;
}[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live attendance", href: "/attendance", icon: Activity },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Leave approvals", href: "/leave", icon: ClipboardList, badgeKey: "leave" },
  { label: "Payroll", href: "/payroll", icon: Wallet },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "User & Roles", href: "/dashboard/roles", icon: UserCog, masterOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavLinks({
  role,
  pendingLeaveCount,
  onNavigate,
}: {
  role: Role;
  pendingLeaveCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visible = items.filter((i) => !i.masterOnly || can.manageRoles(role));

  return (
    <nav className="flex flex-col gap-0.5 p-3 lg:flex-1" aria-label="Admin dashboard">
      {visible.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const badge =
          item.badgeKey === "leave" && pendingLeaveCount > 0 ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#E04F4F] px-1.5 text-[11px] font-bold text-white">
              {pendingLeaveCount > 99 ? "99+" : pendingLeaveCount}
            </span>
          ) : null;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              active
                ? "bg-emerald-50 font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-100"
                : "font-medium text-[#5C6B68] hover:bg-[#F7FAF9]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className="flex min-w-0 items-center gap-2">
              {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden /> : <span className="w-1.5 shrink-0" aria-hidden />}
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span className="truncate">{item.label}</span>
            </span>
            {badge}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminSheetMainMenu({ onClose }: { onClose: () => void }) {
  const nav = useDashboardAdminNav();
  if (!nav) return null;
  return (
    <div className="shrink-0 border-t border-[#E5EAE8] bg-[#F7FAF9] p-3">
      <button
        type="button"
        className="w-full rounded-xl border border-[#E5EAE8] bg-white px-3 py-2.5 text-sm font-semibold text-[#0F1F1B] shadow-sm transition hover:border-[#10B981]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        onClick={() => {
          onClose();
          nav.openMainAppMenu();
        }}
      >
        Full app menu
      </button>
    </div>
  );
}

export function AdminSidebar({
  role,
  pendingLeaveCount,
  mobileOpen,
  onMobileOpenChange,
}: {
  role: Role;
  pendingLeaveCount: number;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      {/* Admin nav is sheet-only on all breakpoints (no fixed left rail on PC). */}
      <Sheet
        open={mobileOpen}
        onOpenChange={onMobileOpenChange}
        title="Admin menu"
        panelId="admin-dashboard-nav-sheet"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5EAE8] px-4">
            <span className="text-sm font-semibold text-[#0F1F1B]">Menu</span>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-[#10B981] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              onClick={() => onMobileOpenChange(false)}
            >
              Close
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavLinks
                role={role}
                pendingLeaveCount={pendingLeaveCount}
                onNavigate={() => onMobileOpenChange(false)}
              />
            </div>
            <AdminSheetMainMenu onClose={() => onMobileOpenChange(false)} />
          </div>
        </div>
      </Sheet>
    </>
  );
}
