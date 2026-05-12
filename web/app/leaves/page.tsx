"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeavesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/leave");
  }, [router]);
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
      Redirecting to Leave...
    </div>
  );
}
