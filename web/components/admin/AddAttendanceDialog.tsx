"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { postParseAttendancePdf } from "@/lib/api/admin";
import { toast } from "sonner";

export function AddAttendanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"manual" | "pdf">("manual");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof postParseAttendancePdf>> | null>(null);
  const [busy, setBusy] = useState(false);

  const onParse = useCallback(async () => {
    if (!file) {
      toast.message("Choose a PDF first");
      return;
    }
    setBusy(true);
    try {
      const res = await postParseAttendancePdf(file);
      setPreview(res);
      toast.success("Parsed (stub) — review rows below");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setBusy(false);
    }
  }, [file]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add attendance"
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5EAE8] px-4 py-3">
          <h2 className="text-base font-semibold text-[#0F1F1B]">Add attendance</h2>
          <button type="button" className="text-sm font-semibold text-[#10B981]" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex border-b border-[#E5EAE8]">
          {(
            [
              ["manual", "Manual entry"],
              ["pdf", "Upload PDF"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 px-3 py-2 text-sm font-semibold ${
                tab === id ? "border-b-2 border-[#10B981] text-[#0F1F1B]" : "text-[#7A8784]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {tab === "manual" ? (
            <div className="space-y-3 text-sm text-[#7A8784]">
              <p>Open the guided manual entry flow (same as header Add Attendance).</p>
              <Link
                href="/attendance-entry"
                className="inline-flex rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white"
                onClick={onClose}
              >
                Go to manual entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5EAE8] bg-[#F7FAF9] px-4 py-8 text-center text-sm text-[#7A8784]">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setPreview(null);
                    setFile(e.target.files?.[0] ?? null);
                  }}
                />
                Drop PDF here or tap to browse
              </label>
              {file ? <p className="text-xs text-[#0F1F1B]">Selected: {file.name}</p> : null}
              <button
                type="button"
                disabled={busy || !file}
                onClick={() => void onParse()}
                className="w-full rounded-xl bg-[#10B981] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Parsing…" : "Parse & preview"}
              </button>
              {preview ? (
                <div className="rounded-xl border border-[#E5EAE8] bg-white p-3 text-xs">
                  <p className="font-semibold text-[#0F1F1B]">Extracted rows (stub)</p>
                  <ul className="mt-2 space-y-1">
                    {preview.rows.map((r, i) => (
                      <li key={i} className="font-mono text-[11px] text-[#7A8784]">
                        {r.employeeCode} · {r.date} · {r.inTime}-{r.outTime} · {(r.confidence * 100).toFixed(0)}%
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[#7A8784]">Commit flow not wired — this is a preview stub.</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
