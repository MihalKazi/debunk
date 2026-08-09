-- Flag rows that were archived from a manually-uploaded screenshot
-- (used for gated pages like Facebook where Wayback's bot can't render the real content).

alter table public.archived_links add column is_screenshot boolean not null default false;
