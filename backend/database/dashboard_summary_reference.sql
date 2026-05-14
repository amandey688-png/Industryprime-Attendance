-- Reference SQL aligned with `backend/services/dashboard_service.get_dashboard_summary`.
-- Adjust table/column names to match your Supabase schema; RLS applies with user JWT.

-- Total employees
-- SELECT count(*)::int AS total_employees FROM employees;

-- Attendance for a calendar date (replace CURRENT_DATE or use $1)
-- SELECT employee_id, late_minutes
-- FROM attendance
-- WHERE date = CURRENT_DATE;

-- Optional: linked user entries (if `attendance_link_entries` exists)
-- SELECT user_id FROM attendance_link_entries WHERE date = CURRENT_DATE LIMIT 500;

-- Present / late / absent (conceptual for one day):
-- present_today = cardinality of distinct IDs from attendance + link entries
-- late            = rows in attendance for that date with late_minutes > 0
-- absent          = max(0, total_employees - present_today)

-- Optional: pending approvals count (also returned on GET /dashboard/summary as pending_leave_requests)
-- SELECT count(*)::int FROM public.leave_requests WHERE lower(status) = 'pending';

-- Attendance trend (per day): aggregate public.attendance + public.attendance_link_entries by date; see get_attendance_trend in dashboard_service.py.

-- Department present today: join employees.department with distinct present employee_ids for :date.

-- Late today: SELECT * FROM public.attendance WHERE date = CURRENT_DATE AND late_minutes > 0;

-- Audit feed: SELECT id, actor_email, action, target_id, metadata, created_at FROM public.audit_events ORDER BY created_at DESC LIMIT 40;
