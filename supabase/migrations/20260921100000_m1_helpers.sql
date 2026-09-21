-- M-1: extensions and shared helper functions.
--
-- Everything Stryder adds lives in `public`; extensions live in `extensions`
-- so they are never exposed through PostgREST.

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
-- Every table with an `updated_at` column gets a BEFORE UPDATE trigger using
-- this function, so the timestamp can never be spoofed by a client.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger: stamps updated_at with the server clock.';
