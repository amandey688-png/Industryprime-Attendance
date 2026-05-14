"use client";

import Link from "next/link";
import { FileDown, FileText, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";

import { AddAttendanceDialog } from "@/components/admin/AddAttendanceDialog";
import { ExportReportDialog } from "@/components/admin/ExportReportDialog";

export function TopActions({
  isMasterAdmin,
  onExportPayroll,
}: {
  isMasterAdmin: boolean;
  onExportPayroll: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-20 -mx-3 border-b border-[#E5EAE8] bg-[#F7FAF9]/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8784]" aria-hidden />
            <input
              readOnly
              placeholder="Search employees, attendance, reports…"
              className="w-full rounded-xl border border-[#E5EAE8] bg-white py-2.5 pl-10 pr-3 text-sm text-[#0F1F1B] outline-none ring-[#10B981] focus:ring-2"
              aria-label="Search (stub)"
            />
          </div>
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add Attendance
            </button>
            <Link
              href="/attendance/upload-pdf"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5EAE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1F1B] shadow-sm"
            >
              <Upload className="h-4 w-4" aria-hidden />
              Upload PDF
            </Link>
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5EAE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1F1B] shadow-sm"
            >
              <FileDown className="h-4 w-4" aria-hidden />
              Export Report
            </button>
            {isMasterAdmin ? (
              <button
                type="button"
                onClick={onExportPayroll}
                className="inline-flex items-center gap-2 rounded-xl border border-[#A78BFA]/50 bg-[#A78BFA]/15 px-4 py-2.5 text-sm font-semibold text-[#0F1F1B] shadow-sm"
              >
                <FileText className="h-4 w-4" aria-hidden />
                Export Payroll
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile FAB menu */}
        <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2 lg:hidden">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={addOpen}
            onClick={() => setAddOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg"
          >
            <Plus className="h-7 w-7" aria-hidden />
            <span className="sr-only">Actions</span>
          </button>
        </div>
      </div>

      <AddAttendanceDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <ExportReportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  );
}
