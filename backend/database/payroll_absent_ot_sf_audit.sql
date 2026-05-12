-- Payroll vs Attendance: reconcile Absent with Status OT/SF (public.attendance.final_status)
-- Replace the month bounds and optional email filter as needed.

-- 1) Reconciliation counts (excluding Sundays & calendar holidays).
--    Payroll ABSENT tracks OT/SF (final_status) when non-blank; raw status=A only fills gaps.
--    Leave "Total Used" still uses status A (+ Sunday/holiday rules) unless you align that separately.
SELECT
  a.employee_id,
  e.name,
  e.email,
  COUNT(*) FILTER (
    WHERE upper(trim(COALESCE(a.status, ''))) = 'A'
      AND EXTRACT(DOW FROM a.date::date) <> 0
      AND NOT EXISTS (SELECT 1 FROM public.holidays h WHERE h.holiday_date = a.date::date)
  ) AS rows_status_a_excluding_sunday_and_holiday,
  COUNT(*) FILTER (
    WHERE trim(COALESCE(a.final_status, '')) <> ''
      AND lower(a.final_status) ~ '(^|[^[:alnum:]])absent([^[:alnum:]]|$)'
      AND lower(trim(a.final_status)) NOT LIKE '%not absent%'
      AND EXTRACT(DOW FROM a.date::date) <> 0
      AND NOT EXISTS (SELECT 1 FROM public.holidays h WHERE h.holiday_date = a.date::date)
  ) AS rows_ot_sf_absent_excluding_sunday_and_holiday
FROM public.attendance a
JOIN public.employees e ON e.id = a.employee_id
WHERE a.date >= DATE '2026-05-01'
  AND a.date < DATE '2026-06-01'
GROUP BY a.employee_id, e.name, e.email
ORDER BY e.name;

-- 2) Rows where Atten=P but OT/SF=Absent — payroll COUNTs these as ABSENT for all employees (Salary Days down, payable prorated). Optional: edit that day + Save so status and OT/SF match.
SELECT a.employee_id, e.email, a.date, a.status, a.final_status
FROM public.attendance a
JOIN public.employees e ON e.id = a.employee_id
WHERE a.date >= DATE '2026-05-01'
  AND a.date < DATE '2026-06-01'
  AND upper(trim(COALESCE(a.status, ''))) = 'P'
  AND lower(COALESCE(a.final_status, '')) ~ '(^|[^[:alnum:]])absent([^[:alnum:]]|$)'
ORDER BY e.email, a.date;

-- 3) Sunday rows marked A (Payroll now forces Sunday to week-off, not absent.)
SELECT a.employee_id, e.email, a.date, a.status, a.final_status
FROM public.attendance a
JOIN public.employees e ON e.id = a.employee_id
WHERE a.date >= DATE '2026-05-01'
  AND a.date < DATE '2026-06-01'
  AND EXTRACT(DOW FROM a.date::date) = 0
  AND upper(trim(COALESCE(a.status, ''))) = 'A'
ORDER BY e.email, a.date;
