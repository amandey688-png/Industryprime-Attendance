import { format, subDays } from "date-fns";
import type { MeDashboard, MeDayBar, MeProfile } from "@/lib/api/me";

function dayBars(): MeDayBar[] {
  const today = new Date();
  const bars: MeDayBar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    const isToday = i === 0;
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    const status: MeDayBar["status"] = weekend ? "weekend" : i === 2 ? "late" : i === 5 ? "off" : "present";
    bars.push({
      date: key,
      label: format(d, "EEE d"),
      status,
      checkIn: weekend ? null : status === "late" ? "09:42" : "09:05",
      checkOut: weekend ? null : "18:02",
      hours: weekend ? 0 : status === "late" ? 8.1 : 8.4,
      isToday,
    });
  }
  return bars;
}

export function mockMeProfile(): MeProfile {
  return {
    shift: "General · 09:30–18:30",
    location: "HQ · Bengaluru",
    joinedAt: "2024-03-12",
  };
}

export function mockMeDashboard(): MeDashboard {
  return {
    updatedAt: new Date().toISOString(),
    today: {
      status: "not_started",
      checkInAt: null,
      checkOutAt: null,
      location: "HQ",
      shiftName: "General shift",
      minutesWorked: 0,
      targetMinutes: 540,
      note: null,
    },
    kpis: {
      presentThisMonth: { current: 18, total: 22 },
      lateArrivals: { count: 2, deltaVsPrevMonth: -1 },
      leaveBalance: { total: 18, used: 5.5, breakdown: "CL 5 · SL 4 · EL 3.5" },
      avgHoursPerDay: { value: 8.2, deltaVsTarget: 0.2 },
    },
    last7Days: dayBars(),
    upcoming: {
      nextHoliday: {
        date: format(subDays(new Date(), -12), "yyyy-MM-dd"),
        title: "Regional holiday",
        subline: "Office closed · plan leave accordingly",
      },
      nextLeave: {
        startDate: format(subDays(new Date(), -5), "yyyy-MM-dd"),
        endDate: format(subDays(new Date(), -3), "yyyy-MM-dd"),
        title: "Approved leave",
        subline: "Casual leave",
        status: "Approved",
      },
    },
  };
}
