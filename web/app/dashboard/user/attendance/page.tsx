import Link from "next/link";

export default function UserAttendanceCalendarPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-[#0F1F1B]">My attendance</h1>
      <p className="text-sm text-[#7A8784]">Full-month calendar view will live here. Use Attendance for day-level detail today.</p>
      <Link href="/attendance" className="text-sm font-semibold text-[#10B981] underline">
        Open Attendance
      </Link>
    </div>
  );
}
