/**
 * UI visibility for nav and header (mirrors product rules; enforce sensitive actions on the API too).
 */

const ADD_ATTENDANCE_HEADER_EMAILS = new Set(["aman@industryprime.com", "ea@industryprime.com"]);

export function normalizeAuthEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Header "Add Attendance" control — only these accounts. */
export function canShowAddAttendanceHeader(email: string | null | undefined): boolean {
  return ADD_ATTENDANCE_HEADER_EMAILS.has(normalizeAuthEmail(email));
}
