-- Reference queries for employee self-service dashboard (`GET /me/dashboard`, `GET /me/profile`).
-- Link login user to roster: `employees.email` must match the JWT email (case-insensitive in the API).

-- 1) Resolve employee
-- SELECT * FROM public.employees WHERE lower(trim(email)) = lower(trim(:auth_email)) LIMIT 1;

-- 2) Today attendance
-- SELECT * FROM public.attendance
-- WHERE employee_id = :employee_id AND date = CURRENT_DATE;

-- 3) Month-to-date attendance (for KPIs + chart inputs)
-- SELECT * FROM public.attendance
-- WHERE employee_id = :employee_id
--   AND date >= date_trunc('month', CURRENT_DATE)::date
--   AND date <= CURRENT_DATE;

-- 4) Working days expected (Mon–Fri) excluding holidays between two dates — computed in API; holidays:
-- SELECT holiday_date, name FROM public.holidays
-- WHERE holiday_date BETWEEN :start AND :end;

-- 5) Leave balance (optional `leave_balances` row)
-- SELECT total_leave FROM public.leave_balances
-- WHERE employee_id = :employee_id AND year = EXTRACT(YEAR FROM CURRENT_DATE)::int;

-- 6) Approved leave usage (for breakdown / used days)
-- SELECT leave_type, sum(days::numeric) AS days
-- FROM public.leave_requests
-- WHERE employee_id = :employee_id AND lower(status) = 'approved'
-- GROUP BY leave_type;

-- 7) Next holiday
-- SELECT holiday_date, name FROM public.holidays
-- WHERE holiday_date >= CURRENT_DATE ORDER BY holiday_date ASC LIMIT 1;

-- 8) Next leave request
-- SELECT * FROM public.leave_requests
-- WHERE employee_id = :employee_id AND leave_date_end >= CURRENT_DATE
-- ORDER BY leave_date_start ASC LIMIT 5;

-- 9) Daily note column (run migration `attendance_employee_note.sql` first)
-- UPDATE public.attendance SET employee_note = :note
-- WHERE employee_id = :employee_id AND date = CURRENT_DATE;
