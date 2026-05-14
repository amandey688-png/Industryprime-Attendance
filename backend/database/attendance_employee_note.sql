-- Optional: persist employee daily note on attendance row (used by POST /me/note).
-- Run in Supabase SQL Editor after `phase2_schema.sql` / `attendance` exists.

alter table public.attendance
  add column if not exists employee_note text;

comment on column public.attendance.employee_note is
  'Short note visible on the employee dashboard; updated via POST /me/note.';
