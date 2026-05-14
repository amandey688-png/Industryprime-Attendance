"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { AddAttendanceDialog } from "@/components/admin/AddAttendanceDialog";
import { Button } from "@/components/ui/dashboard-ui";
import type { Role } from "@/lib/permissions";

/** Top bar actions for `/dashboard` — Add Attendance only (upload/export live under module pages). */
export function DashboardHeaderStrip({ role: _role }: { role: Role }) {
  const [addOpen, setAddOpen] = useState(false);
  void _role;

  return (
    <>
      <div className="hidden md:block">
        <Button type="button" className="bg-[#10B981] hover:bg-emerald-600" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Add Attendance
        </Button>
      </div>

      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Button
          type="button"
          className="h-14 w-14 rounded-full bg-[#10B981] p-0 shadow-lg hover:bg-emerald-600"
          onClick={() => setAddOpen(true)}
          aria-label="Add attendance"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      <AddAttendanceDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
