"use client";

import Link from "next/link";
import { getStoredUser } from "@/lib/auth";

export default function SettingsPlaceholder() {
  const user = getStoredUser();
  if (!user || user.role !== "master_admin") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Access denied.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/40">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Settings
        </div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Master Admin configuration
        </div>
        <div className="mt-4">
          <Link
            href="/settings/email-lists"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Manage Email Lists
          </Link>
        </div>
      </div>
    </div>
  );
}

