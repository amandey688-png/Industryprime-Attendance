"use client";

import { useState } from "react";

import { getStoredToken } from "@/lib/auth";
import { buildExportReportUrl } from "@/lib/api/admin";
import { toast } from "sonner";

export function ExportReportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function download() {
    setBusy(true);
    const toastId = toast.loading("Preparing export…");
    try {
      const url = buildExportReportUrl({ format, from, to });
      const token = getStoredToken();
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `export-${from}-${to}.${format === "csv" ? "csv" : "bin"}`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Download started", { id: toastId });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed", { id: toastId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export report"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-[#0F1F1B]">Export report</h2>
        <p className="mt-1 text-xs text-[#7A8784]">Stub stream — CSV bytes (XLSX/PDF map to same demo file).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#7A8784]">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E5EAE8] px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-[#7A8784]">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E5EAE8] px-2 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-3 block text-xs font-semibold text-[#7A8784]">
          Format
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as typeof format)}
            className="mt-1 w-full rounded-xl border border-[#E5EAE8] px-2 py-2 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX (stub)</option>
            <option value="pdf">PDF (stub)</option>
          </select>
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#7A8784]" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void download()}
            className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Exporting…" : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
