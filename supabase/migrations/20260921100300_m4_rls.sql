-- M-4: Row Level Security.
--
-- Non-negotiable rule 2: RLS on every table, enforced in the database.
-- Non-negotiable rule 1: plan content is private to the athlete who owns it.
--
-- The service role bypasses RLS by design; it is server-only and never reaches
-- the client (non-negotiable rule 4).

alter table public.users            enable row level security;
alter table public.training_blocks  enable row level security;
alter table public.weeks            enable row level security;
alter table public.sessions         enable row level security;
alter table public.session_logs     enable row level security;
alter table public.weekly_summaries enable row level security;
alter table public.streaks          enable row level security;
alter table public.badges           enable row level security;

-- NOTE: FORCE ROW LEVEL SECURITY is deliberately NOT used. Supabase's `postgres`
-- role carries BYPASSRLS, so forcing adds no protection against the table owner,
-- while it does silently break SECURITY DEFINER helpers owned by a role without
-- that attribute. See docs/DECISIONS.md.

-- Explicit privileges. RLS is the gate; these grants make the intended surface
-- readable in one place rather than relying on default privileges.
grant usage on schema public to authenticated, service_role;

grant select, update on public.users to authenticated;
grant select, insert, update, delete on
  public.training_blocks,
  public.weeks,
  public.sessions,
  public.session_logs,
  public.streaks
  to authenticated;

-- Read-only for the client: these are written by Edge Functions only.
grant select on public.weekly_summaries, public.badges to authenticated;

grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
-- No INSERT policy: rows are created by the auth.users trigger.
-- No DELETE policy: account deletion cascades from auth.users.

create policy "users: read own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users: update own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- Owner-only CRUD on the athlete's own plan data
-- ---------------------------------------------------------------------------

create policy "training_blocks: read own"
  on public.training_blocks for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "training_blocks: insert own"
  on public.training_blocks for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "training_blocks: update own"
  on public.training_blocks for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "training_blocks: delete own"
  on public.training_blocks for delete
  to authenticated using ((select auth.uid()) = user_id);

create policy "weeks: read own"
  on public.weeks for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "weeks: insert own"
  on public.weeks for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "weeks: update own"
  on public.weeks for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "weeks: delete own"
  on public.weeks for delete
  to authenticated using ((select auth.uid()) = user_id);

create policy "sessions: read own"
  on public.sessions for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "sessions: insert own"
  on public.sessions for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "sessions: update own"
  on public.sessions for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "sessions: delete own"
  on public.sessions for delete
  to authenticated using ((select auth.uid()) = user_id);

create policy "session_logs: read own"
  on public.session_logs for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "session_logs: insert own"
  on public.session_logs for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "session_logs: update own"
  on public.session_logs for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "session_logs: delete own"
  on public.session_logs for delete
  to authenticated using ((select auth.uid()) = user_id);

create policy "streaks: read own"
  on public.streaks for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "streaks: insert own"
  on public.streaks for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "streaks: update own"
  on public.streaks for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Service-role-write tables
-- ---------------------------------------------------------------------------
-- weekly_summaries and badges are produced by Edge Functions. Athletes can read
-- their own rows and nothing more: there is deliberately no INSERT, UPDATE or
-- DELETE policy, so every client write fails regardless of the payload.

create policy "weekly_summaries: read own"
  on public.weekly_summaries for select
  to authenticated using ((select auth.uid()) = user_id);

create policy "badges: read own"
  on public.badges for select
  to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Free-tier block limit
-- ---------------------------------------------------------------------------
-- One active training block on the free tier. Enforced in the database so the
-- limit holds no matter which client is talking to it.

create or replace function public.enforce_free_tier_block_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_blocks integer;
begin
  if new.status <> 'active' then
    return new;
  end if;

  -- Fail closed: an unknown tier is treated as free, so the limit still applies.
  if coalesce(public.effective_tier(new.user_id), 'free') <> 'free' then
    return new;
  end if;

  select count(*) into active_blocks
  from public.training_blocks tb
  where tb.user_id = new.user_id
    and tb.status = 'active'
    and (tg_op = 'INSERT' or tb.id <> new.id);

  if active_blocks >= 1 then
    raise exception
      'Free tier is limited to one active training block. Archive the current block or upgrade.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on function public.enforce_free_tier_block_limit() is
  'Rejects a second active training block for users whose effective_tier is free.';

create trigger training_blocks_free_tier_limit
  before insert or update on public.training_blocks
  for each row execute function public.enforce_free_tier_block_limit();

-- ---------------------------------------------------------------------------
-- FUTURE: coach access (later phase — do not implement yet)
-- ---------------------------------------------------------------------------
--
-- When squads land, coaches get read access to their squad athletes'
-- COMPLIANCE METRICS ONLY. Plan content is never visible to a coach
-- (non-negotiable rule 1).
--
-- Readable by a coach:      weekly_summaries (score, counts, sent_at),
--                           streaks, badges, sessions.status/scheduled_date/
--                           session_type aggregates.
-- NEVER readable by a coach: sessions.description, sessions.title,
--                           weeks.notes, weeks.focus, session_logs.notes,
--                           weekly_summaries.summary_text, ical_feed_urls,
--                           anything imported from a plan or from Strava.
--
-- Expected shape — a policy per table, gated on squad membership, plus a
-- metrics-only view (or explicit column grants) so plan-content columns are
-- unreachable rather than merely unselected:
--
--   create policy "weekly_summaries: coach reads squad athlete metrics"
--     on public.weekly_summaries for select to authenticated
--     using (exists (
--       select 1
--       from public.squad_members sm
--       join public.squads s on s.id = sm.squad_id
--       where sm.user_id = weekly_summaries.user_id
--         and s.coach_id = (select auth.uid())
--     ));
--
-- Implement this with the coach migration, not before, and add pgTAP tests
-- proving a coach reading a squad athlete gets metrics and NULL/no access to
-- every plan-content column above.
