-- Run in Supabase SQL Editor: per-employee payslip and statutory fields on public.employees
-- Safe to run once; uses IF NOT EXISTS patterns for idempotent deploys.

alter table public.employees
  add column if not exists professional_tax numeric(14, 2);

alter table public.employees
  add column if not exists pf_employee_monthly numeric(14, 2);

alter table public.employees
  add column if not exists income_tax_tds_monthly numeric(14, 2);

alter table public.employees
  add column if not exists hra_monthly numeric(14, 2);

alter table public.employees
  add column if not exists conveyance_monthly numeric(14, 2);

alter table public.employees
  add column if not exists special_allowance_monthly numeric(14, 2);

comment on column public.employees.professional_tax is 'Monthly professional tax (₹); shown on payslip; set by admin per employee.';
comment on column public.employees.pf_employee_monthly is 'Monthly PF deduction (₹), e.g. 12% of basic; set by admin; NULL = blank on payslip.';
comment on column public.employees.income_tax_tds_monthly is 'Monthly TDS (₹); set by admin; NULL = blank on payslip.';
comment on column public.employees.hra_monthly is 'Monthly HRA (₹); employee-editable where allowed; NULL = blank.';
comment on column public.employees.conveyance_monthly is 'Monthly conveyance (₹); employee-editable where allowed; NULL = blank.';
comment on column public.employees.special_allowance_monthly is 'Monthly mobile allowance (₹); paid in full on payslip when set (not attendance-prorated); additive to take-home; NULL = blank. Column name is legacy.';
