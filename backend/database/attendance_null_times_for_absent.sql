-- Allow absent rows (no punch) in public.attendance — required for leave "Total Used".
-- Run once in Supabase SQL Editor if inserts fail with NOT NULL on check_in/check_out.

alter table public.attendance
  alter column check_in drop not null,
  alter column check_out drop not null;
