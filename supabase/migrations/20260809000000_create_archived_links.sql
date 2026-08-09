-- Shared history table for the /archiver office tool.
-- Public utility page has no login gate, so anon can both write and read entries.

create table public.archived_links (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  wayback_url text,
  archive_ph_url text,
  status text not null default 'pending', -- pending | done | failed
  created_at timestamptz not null default now()
);

alter table public.archived_links enable row level security;

create policy "anon can read archived_links"
on public.archived_links
for select
to anon
using (true);

create policy "anon can insert archived_links"
on public.archived_links
for insert
to anon
with check (true);

create policy "anon can update archived_links"
on public.archived_links
for update
to anon
using (true)
with check (true);
