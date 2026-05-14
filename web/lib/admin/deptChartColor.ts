/** Stable chart color from arbitrary department name (DB-driven teams). */
const PALETTE = ["#10B981", "#3B82F6", "#F59E0B", "#A78BFA", "#EC4899", "#14B8A6", "#F97316", "#6366F1"];

export function deptChartColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return PALETTE[h % PALETTE.length]!;
}
