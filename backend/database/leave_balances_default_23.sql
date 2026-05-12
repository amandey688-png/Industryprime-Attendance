-- Seed annual total_leave (CL + SL) per employee for the current calendar year.
-- Named emails use fixed values; Adrija = 0; everyone else = 23.
-- Run after public.leave_balances and public.employees exist.
-- App logic: backend/services/leave_service.py (_DEFAULT_TOTAL_LEAVE_BY_EMAIL) matches this when no row exists.

WITH yr AS (SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS y)
INSERT INTO public.leave_balances (employee_id, year, total_leave, updated_at)
SELECT
  e.id,
  yr.y,
  CASE lower(trim(e.email))
    WHEN 'ea@industryprime.com' THEN 16
    WHEN 'aman@industryprime.com' THEN 21
    WHEN 'rimpa@industryprime.com' THEN 21
    WHEN 'shreyasi@industryprime.com' THEN 20
    WHEN 'akash@industryprime.com' THEN 20
    WHEN 'adrija@industryprime.com' THEN 0
    ELSE 23
  END::numeric,
  now()
FROM public.employees e
CROSS JOIN yr
ON CONFLICT (employee_id, year) DO UPDATE
SET
  total_leave = EXCLUDED.total_leave,
  updated_at = now();
