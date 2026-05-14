"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function FloatingRefresh({
  lastUpdatedIso,
  onRefresh,
}: {
  lastUpdatedIso: string | null;
  onRefresh: () => void;
}) {
  const [spin, setSpin] = useState(false);

  const label = lastUpdatedIso
    ? new Date(lastUpdatedIso).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden max-w-[min(100vw-2rem,22rem)] items-center gap-3 rounded-full border border-[#E5EAE8] bg-white px-4 py-2.5 text-sm shadow-md lg:flex">
      <span className="pointer-events-auto font-medium leading-snug text-[#0F1F1B]">
        Last updated <span className="font-bold tabular-nums">{label}</span>
      </span>
      <button
        type="button"
        aria-label="Reload now"
        className={`pointer-events-auto rounded-full border border-[#E5EAE8] p-2 hover:bg-[#F7FAF9] ${spin ? "animate-spin" : ""}`}
        onClick={() => {
          setSpin(true);
          onRefresh();
          window.setTimeout(() => setSpin(false), 600);
        }}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
