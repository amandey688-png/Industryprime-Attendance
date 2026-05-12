create extension if not exists pgcrypto;

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_action_idx on public.audit_events(action);
create index if not exists audit_events_created_at_idx on public.audit_events(created_at desc);
