/** Worked time as `HH:MM` (no suffix). */
export function formatWorkedHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Daily target label, e.g. `09:00 Hr` for a 9-hour target. */
export function formatTargetHr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")} Hr`;
}
