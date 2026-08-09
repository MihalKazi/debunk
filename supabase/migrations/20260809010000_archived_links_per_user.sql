-- Scope archived_links to the authenticated user who created it.
-- Tool now requires staff login; each user sees only their own history.

alter table public.archived_links add column user_id uuid references auth.users(id) default auth.uid();

drop policy "anon can read archived_links" on public.archived_links;
drop policy "anon can insert archived_links" on public.archived_links;
drop policy "anon can update archived_links" on public.archived_links;

create policy "users can read own archived_links"
on public.archived_links
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own archived_links"
on public.archived_links
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own archived_links"
on public.archived_links
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
