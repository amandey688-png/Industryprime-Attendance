/** In-memory admin dashboard mocks (dev / stub). Survives HMR via globalThis. */

export type PendingLeave = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  avatarUrl: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
};

export type LateRow = {
  id: string;
  employeeId: string;
  /** Display code e.g. EMP-1042 */
  employeeCode?: string;
  name: string;
  department: string;
  checkIn: string;
  lateByMinutes: number;
  avatarUrl: string | null;
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  payload: Record<string, unknown>;
};

type Store = {
  pendingLeaves: PendingLeave[];
  removedLeaves: { row: PendingLeave }[];
};

const g = globalThis as unknown as { __ipAdminMockStore?: Store };

function initStore(): Store {
  const pendingLeaves: PendingLeave[] = [
    {
      id: "lv-1001",
      employeeId: "e-01",
      name: "Adrija Biswas",
      department: "Engineering",
      avatarUrl: null,
      leaveType: "Casual leave",
      startDate: "2026-05-16",
      endDate: "2026-05-17",
      days: 2,
      reason: "Family function",
    },
    {
      id: "lv-1002",
      employeeId: "e-02",
      name: "Akash Das",
      department: "Operations",
      avatarUrl: null,
      leaveType: "Sick",
      startDate: "2026-05-18",
      endDate: "2026-05-18",
      days: 1,
      reason: "Medical appointment",
    },
    {
      id: "lv-1003",
      employeeId: "e-03",
      name: "Sourav Roy",
      department: "Sales",
      avatarUrl: null,
      leaveType: "Casual leave",
      startDate: "2026-05-20",
      endDate: "2026-05-21",
      days: 2,
      reason: "Family function",
    },
  ];
  return { pendingLeaves, removedLeaves: [] };
}

export function getAdminMockStore(): Store {
  if (!g.__ipAdminMockStore) g.__ipAdminMockStore = initStore();
  return g.__ipAdminMockStore;
}

export function removePendingLeave(id: string): PendingLeave | null {
  const s = getAdminMockStore();
  const idx = s.pendingLeaves.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const [row] = s.pendingLeaves.splice(idx, 1);
  s.removedLeaves.push({ row });
  return row;
}

export function restoreLastRemovedLeave(id: string): PendingLeave | null {
  const s = getAdminMockStore();
  for (let i = s.removedLeaves.length - 1; i >= 0; i--) {
    if (s.removedLeaves[i].row.id === id) {
      const { row } = s.removedLeaves.splice(i, 1)[0];
      if (!s.pendingLeaves.some((p) => p.id === row.id)) {
        s.pendingLeaves.unshift(row);
      }
      return row;
    }
  }
  return null;
}

export function mockLateRows(deptFilter: string | null): LateRow[] {
  const all: LateRow[] = [
    {
      id: "late-1",
      employeeId: "e-1042",
      employeeCode: "EMP-1042",
      name: "Sourav Roy",
      department: "Sales",
      checkIn: "10:18 AM",
      lateByMinutes: 78,
      avatarUrl: null,
    },
    {
      id: "late-2",
      employeeId: "e-01",
      employeeCode: "EMP-1001",
      name: "Adrija Biswas",
      department: "Engineering",
      checkIn: "09:42 AM",
      lateByMinutes: 12,
      avatarUrl: null,
    },
    {
      id: "late-3",
      employeeId: "e-03",
      employeeCode: "EMP-1103",
      name: "Rahul Verma",
      department: "Engineering",
      checkIn: "10:05 AM",
      lateByMinutes: 35,
      avatarUrl: null,
    },
    {
      id: "late-4",
      employeeId: "e-04",
      employeeCode: "EMP-1004",
      name: "Sneha Kulkarni",
      department: "HR / Admin",
      checkIn: "09:51 AM",
      lateByMinutes: 21,
      avatarUrl: null,
    },
    {
      id: "late-5",
      employeeId: "e-05",
      employeeCode: "EMP-1005",
      name: "Priya Nair",
      department: "Operations",
      checkIn: "10:22 AM",
      lateByMinutes: 52,
      avatarUrl: null,
    },
  ];
  if (!deptFilter) return all;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const f = norm(deptFilter);
  return all.filter((r) => norm(r.department) === f);
}

export function mockAuditEvents(): AuditEvent[] {
  const now = Date.now();
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `aud-${i}`,
    at: new Date(now - i * 61_000).toISOString(),
    actor: i % 3 === 0 ? "Aman (master_admin)" : "Admin Bot",
    action: ["ROLE_CHANGED", "ATTENDANCE_EDIT", "EXPORT_PAYROLL", "LEAVE_APPROVED", "USER_INVITED"][i % 5]!,
    target: `employee:${100 + i}`,
    payload: { id: `aud-${i}`, index: i, note: "stub audit payload" },
  }));
}
