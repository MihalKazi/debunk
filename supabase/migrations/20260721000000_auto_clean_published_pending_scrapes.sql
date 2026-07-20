-- Prevent pending_scrapes from accumulating rows that duplicate an already-published
-- debunks entry (same source_link). This can happen when a fact-check is published
-- manually (bypassing the review-approve flow) and later re-scraped from a sheet sync.
-- Self-cleaning at the DB level means no scraper/script needs to know about this.

create or replace function public.delete_pending_if_already_published()
returns trigger as $$
begin
  if exists (
    select 1 from public.debunks d
    where d.source_link = new.source_link
  ) then
    delete from public.pending_scrapes where id = new.id;
    return null;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_delete_pending_if_already_published
after insert on public.pending_scrapes
for each row
execute function public.delete_pending_if_already_published();
