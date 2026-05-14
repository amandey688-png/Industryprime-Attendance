import Link from "next/link";

export default function AdminRolesHubPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[#E5EAE8] bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-[#0F1F1B]">User &amp; role control</h1>
      <p className="text-sm text-[#7A8784]">Master Admins manage roles on the Users page.</p>
      <Link href="/users" className="text-sm font-semibold text-[#10B981] underline">
        Open Users
      </Link>
    </div>
  );
}
