"use client";

import { getStoredToken } from "@/lib/auth";

async function meFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const rel = path.startsWith("/") ? path : `/${path}`;
  const url = `/api/me${rel}`;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = JSON.parse(text) as { detail?: string };
      if (typeof j.detail === "string") msg = j.detail;
    } catch {
      if (text) msg = text.slice(0, 200);
    }
    throw new Error(msg);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export type TodayStatus = "not_started" | "working" | "on_break" | "done";

export type MeToday = {
  status: TodayStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
  location: string | null;
  shiftName: string;
  minutesWorked: number;
  targetMinutes: number;
  note: string | null;
};

export type MeKpis = {
  presentThisMonth: { current: number; total: number };
  lateArrivals: { count: number; deltaVsPrevMonth: number };
  leaveBalance: { total: number; used: number; breakdown: string };
  avgHoursPerDay: { value: number; deltaVsTarget: number };
};

export type MeDayBar = {
  date: string;
  label: string;
  status: "present" | "late" | "off" | "weekend";
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
  isToday: boolean;
};

export type MeHoliday = {
  date: string;
  title: string;
  subline: string;
};

export type MeLeaveItem = {
  startDate: string;
  endDate: string;
  title: string;
  subline: string;
  status: string;
};

export type MeDashboard = {
  updatedAt: string;
  today: MeToday;
  kpis: MeKpis;
  last7Days: MeDayBar[];
  upcoming: {
    nextHoliday: MeHoliday | null;
    nextLeave: MeLeaveItem | null;
  };
};

export type MeProfile = {
  shift: string;
  location: string;
  joinedAt: string;
};

export function fetchMeDashboard(): Promise<MeDashboard> {
  return meFetch<MeDashboard>("/dashboard");
}

export function fetchMeProfile(): Promise<MeProfile> {
  return meFetch<MeProfile>("/profile");
}

export type PunchIntent = "check-in" | "check-out" | "break-start" | "break-end";

export function postMePunch(body: {
  intent: PunchIntent;
  checkInAt?: string | null;
}): Promise<{ today: MeToday; updatedAt: string }> {
  return meFetch("/punch", { method: "POST", body: JSON.stringify(body) });
}

export function postMeNote(body: { note: string }): Promise<{ ok: boolean; note: string | null }> {
  return meFetch("/note", { method: "POST", body: JSON.stringify(body) });
}

/** Client-only overlay for today (persists reload). */
export const USER_TODAY_LS = "industryprime.userTodayOverlay";

export type TodayOverlay = {
  date: string;
  status: TodayStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
  minutesWorked: number;
  note: string | null;
};

export function readTodayOverlay(): TodayOverlay | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_TODAY_LS);
    if (!raw) return null;
    return JSON.parse(raw) as TodayOverlay;
  } catch {
    return null;
  }
}

export function writeTodayOverlay(overlay: TodayOverlay | null) {
  if (typeof window === "undefined") return;
  if (!overlay) {
    window.localStorage.removeItem(USER_TODAY_LS);
    return;
  }
  window.localStorage.setItem(USER_TODAY_LS, JSON.stringify(overlay));
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function mergeDashboardWithOverlay(d: MeDashboard): MeDashboard {
  const o = readTodayOverlay();
  const key = todayKey();
  if (!o || o.date !== key) return d;
  const serverHasCheckIn = Boolean(d.today.checkInAt);
  if (serverHasCheckIn) {
    const overlayNote = (o.note ?? "").trim();
    return {
      ...d,
      today: {
        ...d.today,
        note: overlayNote ? o.note : d.today.note,
      },
    };
  }
  return {
    ...d,
    today: {
      ...d.today,
      status: o.status,
      checkInAt: o.checkInAt,
      checkOutAt: o.checkOutAt,
      minutesWorked: o.minutesWorked,
      note: (o.note ?? "").trim() ? o.note : d.today.note,
    },
  };
}
