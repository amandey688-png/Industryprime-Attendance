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

import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  masterOnly?: boolean;
};

export function AdminDashboardNav({
  pendingLeaveCount,
  isMasterAdmin,
}: {
  pendingLeaveCount: number;
  isMasterAdmin: boolean;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Live attendance", href: "/attendance", icon: Activity },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Leave approvals", href: "/leave", icon: ClipboardList, badge: pendingLeaveCount },
    { label: "Payroll", href: "/payroll", icon: Wallet },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "User & Roles", href: "/users", icon: UserCog, masterOnly: true },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const visible = items.filter((i) => !i.masterOnly || isMasterAdmin);

  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-[#E5EAE8] bg-white lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-[#E5EAE8] px-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-500 shadow-sm"
          aria-hidden
        >
          <span className="text-[10px] font-bold text-white">IP</span>
        </div>
        <span className="truncate text-sm font-semibold text-[#0F1F1B]">IndustryPrime</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin dashboard sections">
        {visible.map((item) => {
          const active =
            item.href === "/dashboard/admin"
              ? pathname === "/dashboard/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-emerald-50 text-emerald-800" : "text-[#0F1F1B] hover:bg-[#F7FAF9]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge != null && item.badge > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#E04F4F] px-1.5 text-[11px] font-bold text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
