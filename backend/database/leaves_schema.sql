create extension if not exists pgcrypto;

create table if not exists public.leaves (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.users(id),
  from_date date not null,
  to_date date not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by_email text,
  decided_at timestamptz,
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.leave_decision_tokens (
  token text primary key,
  leave_id uuid not null references public.leaves(id) on delete cascade,
  recipient_email text not null,
  action text not null check (action in ('approve','reject')),
  expires_at timestamptz not null,
  consumed_at timestamptz
);
