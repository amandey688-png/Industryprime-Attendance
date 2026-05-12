-- Verification: absent rows used for Leave "Total Used" (matches app: status A, not Sunday, not in holidays).
-- Replace the date range with your Leave page month (example: May 2026).

-- Count absents per employee (adjust date bounds)
SELECT
  a.employee_id,
  e.name,
  e.email,
  COUNT(*) AS absent_days_attendance_table
FROM public.attendance a
JOIN public.employees e ON e.id = a.employee_id
WHERE a.date >= DATE '2026-05-01'
  AND a.date < DATE '2026-06-01'
  AND a.date <= CURRENT_DATE
  AND upper(trim(COALESCE(a.status, ''))) = 'A'
  AND EXTRACT(DOW FROM a.date::date) <> 0
  AND NOT EXISTS (
    SELECT 1 FROM public.holidays h WHERE h.holiday_date = a.date::date
  )
GROUP BY a.employee_id, e.name, e.email
ORDER BY e.name;

-- Inspect recent absent rows stored in attendance
SELECT employee_id, date, status
FROM public.attendance
WHERE upper(trim(COALESCE(status, ''))) = 'A'
ORDER BY date DESC
LIMIT 100;
