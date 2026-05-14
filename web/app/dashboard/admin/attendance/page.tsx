import Link from "next/link";

export default function AdminAttendanceHubPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-[#0F1F1B]">Attendance (admin)</h1>
      <p className="text-sm text-[#7A8784]">Use the main attendance tools for uploads and review.</p>
      <div className="flex flex-col gap-2 text-sm font-semibold text-[#10B981]">
        <Link href="/attendance" className="underline">
          Attendance hub
        </Link>
        <Link href="/attendance/upload-pdf" className="underline">
          Upload PDF (daily report)
        </Link>
        <Link href="/attendance-entry" className="underline">
          Manual entry
        </Link>
      </div>
    </div>
  );
}
