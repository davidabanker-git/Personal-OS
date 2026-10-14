-- Open Brain core: thoughts table, vector search, dedup upsert.
-- Based on OB1 docs/01-getting-started.md, so OB1's MCP server works unmodified.
-- Hardening vs. upstream: vector lives in the extensions schema, functions pin
-- search_path, and RPCs are callable only by service_role (edge functions).

create extension if not exists vector with schema extensions;

create table public.thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  content_fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index thoughts_embedding_idx on public.thoughts
  using hnsw (embedding extensions.vector_cosine_ops);
create index thoughts_metadata_idx on public.thoughts using gin (metadata);
create index thoughts_created_at_idx on public.thoughts (created_at desc);
create unique index idx_thoughts_fingerprint on public.thoughts (content_fingerprint)
  where content_fingerprint is not null;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger thoughts_updated_at
  before update on public.thoughts
  for each row execute function public.update_updated_at();

create or replace function public.match_thoughts(
  query_embedding extensions.vector(1536),
  match_threshold float default 0.7,
  match_count int default 10,
  filter jsonb default '{}'::jsonb
)
returns table (id uuid, content text, metadata jsonb, similarity float, created_at timestamptz)
language plpgsql
stable
set search_path = public, extensions
as $$
begin
  return query
  select t.id, t.content, t.metadata,
         1 - (t.embedding <=> query_embedding) as similarity,
         t.created_at
  from public.thoughts t
  where 1 - (t.embedding <=> query_embedding) > match_threshold
    and (filter = '{}'::jsonb or t.metadata @> filter)
  order by t.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Inserts a thought, or merges metadata into the existing row with the same
-- normalized content (sha256 of lowercased, whitespace-collapsed text).
create or replace function public.upsert_thought(p_content text, p_payload jsonb default '{}')
returns jsonb
language plpgsql
set search_path = public, extensions
as $$
declare
  v_fingerprint text;
  v_id uuid;
begin
  v_fingerprint := encode(sha256(convert_to(
    lower(trim(regexp_replace(p_content, '\s+', ' ', 'g'))), 'UTF8')), 'hex');

  insert into public.thoughts (content, content_fingerprint, metadata)
  values (p_content, v_fingerprint, coalesce(p_payload->'metadata', '{}'::jsonb))
  on conflict (content_fingerprint) where content_fingerprint is not null do update
    set updated_at = now(),
        metadata = thoughts.metadata || coalesce(excluded.metadata, '{}'::jsonb)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'fingerprint', v_fingerprint);
end;
$$;

-- Access: RLS on with no anon/authenticated policies, so only service_role
-- (which bypasses RLS) can read or write.
alter table public.thoughts enable row level security;
revoke all on table public.thoughts from anon, authenticated;
grant select, insert, update, delete on table public.thoughts to service_role;

revoke all on function public.match_thoughts(extensions.vector, float, int, jsonb) from public, anon, authenticated;
revoke all on function public.upsert_thought(text, jsonb) from public, anon, authenticated;
revoke all on function public.update_updated_at() from public, anon, authenticated;
grant execute on function public.match_thoughts(extensions.vector, float, int, jsonb) to service_role;
grant execute on function public.upsert_thought(text, jsonb) to service_role;
