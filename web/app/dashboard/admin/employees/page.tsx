import Link from "next/link";

export default function AdminEmployeesHubPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-[#0F1F1B]">Employee management</h1>
      <p className="text-sm text-[#7A8784]">Directory and payslip fields live on the Employees page.</p>
      <Link href="/employees" className="text-sm font-semibold text-[#10B981] underline">
        Open Employees
      </Link>
    </div>
  );
}
