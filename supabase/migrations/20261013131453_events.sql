-- Event log: an append-only record of what the OS did and why.
-- Feeds the friction report, triage tuning and weekly automation discovery.
-- Corrections are new rows (event_type = 'correction'), never edits.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  event_type text not null,   -- capture, triage, correction, approval, task, receipt, friction, habit, routine
  source text,                -- slack, mcp, routine, linear, jev, ...
  actor text,                 -- david, claude, codex, jev, ...
  thought_id uuid references public.thoughts(id) on delete set null,
  linear_issue_id text,       -- Linear owns task state; we keep only the link
  confidence real check (confidence is null or (confidence >= 0 and confidence <= 1)),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_type_occurred_idx on public.events (event_type, occurred_at desc);
create index events_occurred_idx on public.events (occurred_at desc);
create index events_thought_idx on public.events (thought_id);
create index events_linear_issue_idx on public.events (linear_issue_id) where linear_issue_id is not null;

-- Service role only, and append-only: no update or delete grants.
alter table public.events enable row level security;
revoke all on table public.events from anon, authenticated, service_role;
grant select, insert on table public.events to service_role;
