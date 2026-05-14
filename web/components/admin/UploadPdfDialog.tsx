"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/dashboard-ui";
import { postParseAttendancePdf } from "@/lib/api/admin";

export function UploadPdfDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof postParseAttendancePdf>> | null>(null);
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
    else toast.message("Please drop a PDF file");
  }, []);

  const onParse = useCallback(async () => {
    if (!file) {
      toast.message("Choose a PDF first");
      return;
    }
    setBusy(true);
    try {
      const res = await postParseAttendancePdf(file);
      setPreview(res);
      toast.success("Parsed — review rows below before committing (stub).");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setBusy(false);
    }
  }, [file]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload attendance PDF"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5EAE8] px-4 py-3">
          <h2 className="text-base font-semibold text-[#0F1F1B]">Upload PDF</h2>
          <button
            type="button"
            className="text-sm font-semibold text-[#10B981] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E5EAE8] bg-[#F7FAF9] px-4 py-10 text-center"
          >
            <Upload className="h-8 w-8 text-[#7A8784]" aria-hidden />
            <p className="text-sm text-[#0F1F1B]">Drag and drop a daily attendance PDF</p>
            <label className="mt-2 text-xs font-semibold text-[#10B981] underline">
              Browse files
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file ? <p className="text-xs text-[#7A8784]">{file.name}</p> : null}
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" disabled={!file || busy} onClick={() => void onParse()}>
              {busy ? "Parsing…" : "Preview parse"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setPreview(null)}>
              Reset
            </Button>
          </div>
          {preview?.rows?.length ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5EAE8]">
              <table className="w-full min-w-[480px] text-xs">
                <thead>
                  <tr className="bg-[#F7FAF9] text-left text-[10px] font-bold uppercase text-[#7A8784]">
                    <th className="px-2 py-2">Code</th>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">In</th>
                    <th className="px-2 py-2">Out</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-t border-[#E5EAE8]">
                      <td className="px-2 py-1">{r.employeeCode}</td>
                      <td className="px-2 py-1">{r.date}</td>
                      <td className="px-2 py-1">{r.inTime}</td>
                      <td className="px-2 py-1">{r.outTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-[#E5EAE8] bg-[#F7FAF9] px-3 py-2 text-[11px] text-[#7A8784]">
                Commit to database is a stub — use this preview to verify parsing quality.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
