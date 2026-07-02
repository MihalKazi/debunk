-- Enable RLS and lock down tables now that the anon key will actually be anon-privileged.
-- Public site only ever needs read access to published debunks.
-- pending_scrapes and unpublished debunks must never be readable/writable by anon.
-- Admin panel operations require an authenticated Supabase Auth session.

alter table public.debunks enable row level security;
alter table public.pending_scrapes enable row level security;

-- Public (anon) can read only published debunks.
create policy "public can read published debunks"
on public.debunks
for select
to anon
using (is_published is distinct from false);

-- Authenticated (logged-in admin) users get full access to debunks.
create policy "authenticated full access debunks"
on public.debunks
for all
to authenticated
using (true)
with check (true);

-- Authenticated (logged-in admin) users get full access to pending_scrapes.
-- No anon policy at all -> anon has zero access to this table.
create policy "authenticated full access pending_scrapes"
on public.pending_scrapes
for all
to authenticated
using (true)
with check (true);

-- Storage: evidence bucket. Public needs to view images used on published pages,
-- but only authenticated admins can upload/modify/delete.
create policy "public can read evidence bucket"
on storage.objects
for select
to anon
using (bucket_id = 'evidence');

create policy "authenticated can manage evidence bucket"
on storage.objects
for all
to authenticated
using (bucket_id = 'evidence')
with check (bucket_id = 'evidence');
