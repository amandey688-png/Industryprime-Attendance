"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Ctx = {
  /** Exact `/dashboard` (admin home), not `/dashboard/user`. */
  isStaffDashboard: boolean;
  adminNavOpen: boolean;
  setAdminNavOpen: (open: boolean) => void;
  toggleAdminNav: () => void;
  /** Opens the global app sidebar (Attendance, Leave, …). */
  openMainAppMenu: () => void;
};

const DashboardAdminNavContext = createContext<Ctx | null>(null);

export function useDashboardAdminNav(): Ctx | null {
  return useContext(DashboardAdminNavContext);
}

export function DashboardAdminNavProvider({
  children,
  pathname,
  onOpenMainSidebar,
  onCloseMainSidebar,
}: {
  children: ReactNode;
  pathname: string;
  onOpenMainSidebar: () => void;
  onCloseMainSidebar: () => void;
}) {
  const [adminNavOpen, setAdminNavOpen] = useState(false);

  const isStaffDashboard = pathname === "/dashboard";

  useEffect(() => {
    if (!isStaffDashboard) setAdminNavOpen(false);
  }, [isStaffDashboard, pathname]);

  const openMainAppMenu = useCallback(() => {
    setAdminNavOpen(false);
    onOpenMainSidebar();
  }, [onOpenMainSidebar]);

  const toggleAdminNav = useCallback(() => {
    setAdminNavOpen((prev) => {
      const next = !prev;
      if (next) onCloseMainSidebar();
      return next;
    });
  }, [onCloseMainSidebar]);

  const value = useMemo(
    () =>
      ({
        isStaffDashboard,
        adminNavOpen,
        setAdminNavOpen,
        toggleAdminNav,
        openMainAppMenu,
      }) satisfies Ctx,
    [isStaffDashboard, adminNavOpen, openMainAppMenu, toggleAdminNav],
  );

  return <DashboardAdminNavContext.Provider value={value}>{children}</DashboardAdminNavContext.Provider>;
}
