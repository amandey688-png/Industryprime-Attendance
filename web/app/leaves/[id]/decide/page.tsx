"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

type Preview = {
  leave: {
    id: string;
    from_date: string;
    to_date: string;
    reason: string;
    status: string;
  };
  action: "approve" | "reject";
  already_decided: boolean;
};

export default function LeaveDecisionPage() {
  const params = useParams<{ id: string }>();
  const leaveId = params.id;
  const search = useSearchParams();
  const token = useMemo(() => (search.get("token") || "").trim(), [search]);
  const action = useMemo(() => (search.get("action") || "").trim().toLowerCase(), [search]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
        const res = await fetch(`${base}/leaves/${leaveId}/decide?token=${encodeURIComponent(token)}`);
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Failed to validate decision link");
        setPreview(JSON.parse(text) as Preview);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    }
    if (leaveId && token) void run();
  }, [leaveId, token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Remarks are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      const res = await fetch(`${base}/leaves/${leaveId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, remarks: remarks.trim() }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to submit decision");
      setDone(`Leave ${action === "approve" ? "approved" : "rejected"} successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit decision");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-zinc-500">Loading decision link...</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  if (!preview) return <div className="text-sm text-zinc-500">Invalid link.</div>;
  if (preview.already_decided) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">This leave is already decided.</div>;
  }
  if (done) return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{done}</div>;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-950/40">
      <h1 className="text-lg font-bold">{action === "approve" ? "Approve Leave" : "Reject Leave"}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Dates: {preview.leave.from_date} {"->"} {preview.leave.to_date}
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Reason: {preview.leave.reason}</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold">
          Remarks (required)
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Submitting..." : action === "approve" ? "Approve" : "Reject"}
        </button>
      </form>
    </div>
  );
}
