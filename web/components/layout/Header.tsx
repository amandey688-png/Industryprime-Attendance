"use client";

import AddAttendanceHeaderLink from "./AddAttendanceHeaderLink";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { DRAWER_ID } from "./Sidebar";
import { IconMenu, IconSearch } from "./icons";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 -mx-3 border-b border-zinc-200/60 bg-white/85 px-3 backdrop-blur-md sm:-mx-6 sm:px-6 dark:border-zinc-800/60 dark:bg-zinc-950/90">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 py-3 sm:gap-x-3 md:h-16 md:flex-nowrap md:gap-x-4 md:py-0">
        {/* 1 — Sidebar toggle (leftmost) */}
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white/80 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-100"
          onClick={onToggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls={DRAWER_ID}
          aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <IconMenu className="h-5 w-5" />
        </button>

        {/* 2 — Search */}
        <div className="relative min-w-0 flex-1 basis-full sm:basis-0 sm:min-w-[12rem] md:max-w-[520px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search employees, attendance, reports..."
            className="w-full rounded-2xl border border-zinc-200 bg-white/70 py-2 pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            aria-label="Search employees, attendance, and reports"
          />
        </div>

        {/* 3–6 — Actions (right cluster) */}
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-x-2 sm:ml-auto sm:w-auto sm:flex-nowrap sm:gap-x-3 md:gap-x-4">
          <AddAttendanceHeaderLink />
          <NotificationBell />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
