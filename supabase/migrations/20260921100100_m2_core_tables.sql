-- M-2: core tables.
--
-- Scope note: coach tables (squads, squad_members, coach_messages), referrals,
-- card_shares, challenge_cards and churn_risk_assessments are later phases and
-- are deliberately absent.
--
-- Strava / Google Calendar token columns are deliberately NOT on public.users.
-- They arrive with the integration migration, once the encryption approach
-- (Supabase Vault vs application-level) is decided. See docs/DECISIONS.md.

-- ---------------------------------------------------------------------------
-- users  (athlete profile, 1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.users (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text not null,
  full_name           text,
  avatar_url          text,
  role                text not null default 'athlete'
                        check (role in ('athlete', 'coach')),
  tier                text not null default 'free'
                        check (tier in ('free', 'athlete', 'coach')),
  trial_ends_at       timestamptz,
  stripe_customer_id  text unique,
  ical_feed_urls      text[] not null default '{}',
  timezone            text not null default 'Europe/Dublin',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.users is
  'Athlete/coach profile. Created automatically by the auth.users insert trigger.';
comment on column public.users.tier is
  'Paid tier. Use public.effective_tier(id) for entitlement checks — it accounts for the reverse trial.';
comment on column public.users.trial_ends_at is
  '30-day reverse trial, no card required. Set at signup.';

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Profile creation on signup (30-day reverse trial)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, trial_ends_at)
  values (
    new.id,
    new.email,
    -- Google OAuth supplies full_name/name and avatar_url/picture.
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    now() + interval '30 days'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the public.users row for a new auth user and opens the 30-day reverse trial.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- training_blocks
-- ---------------------------------------------------------------------------

create table public.training_blocks (
  id          uuid primary key default extensions.gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  name        text not null,
  sport       text not null default 'other'
                check (sport in ('running', 'triathlon', 'cycling', 'swimming',
                                 'hyrox', 'rugby', 'gaa', 'strength', 'other')),
  goal_event  text,
  goal_date   date,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'active'
                check (status in ('draft', 'active', 'completed', 'archived')),
  source      text not null default 'manual'
                check (source in ('manual', 'ical', 'pdf', 'template')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint training_blocks_dates_ordered check (end_date >= start_date)
);

comment on table public.training_blocks is
  'A training block: one plan with a start, an end and usually a goal event.';
comment on column public.training_blocks.source is
  'Where the plan came from. Stryder imports plans, it never generates them.';

create index training_blocks_user_id_idx on public.training_blocks (user_id);
create index training_blocks_user_status_idx on public.training_blocks (user_id, status);

create trigger training_blocks_set_updated_at
  before update on public.training_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- weeks
-- ---------------------------------------------------------------------------

create table public.weeks (
  id           uuid primary key default extensions.gen_random_uuid(),
  -- user_id is denormalised so every RLS policy is a single-column check
  -- with no join. Kept consistent by weeks_user_matches_block().
  user_id      uuid not null references public.users (id) on delete cascade,
  block_id     uuid not null references public.training_blocks (id) on delete cascade,
  week_number  integer not null check (week_number > 0),
  start_date   date not null,
  phase        text check (phase in ('base', 'build', 'peak', 'taper')),
  focus        text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (block_id, week_number)
);

comment on table public.weeks is 'A week within a training block (meso level).';
comment on column public.weeks.notes is
  'PRIVATE plan content. Never exposed to coaches, other athletes or share cards.';

create index weeks_user_id_idx on public.weeks (user_id);
create index weeks_block_id_idx on public.weeks (block_id);
create index weeks_start_date_idx on public.weeks (user_id, start_date);

create trigger weeks_set_updated_at
  before update on public.weeks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------

create table public.sessions (
  id                    uuid primary key default extensions.gen_random_uuid(),
  user_id               uuid not null references public.users (id) on delete cascade,
  block_id              uuid not null references public.training_blocks (id) on delete cascade,
  week_id               uuid references public.weeks (id) on delete set null,
  scheduled_date        date not null,
  session_type          text not null
                          check (session_type in (
                            'run', 'ride', 'swim', 'brick', 'gym', 'hyrox',
                            'rugby_training', 'gaa_training', 'match',
                            'mobility', 'physio', 'rest', 'other')),
  title                 text,
  description           text,
  intensity             text check (intensity in ('easy', 'moderate', 'hard', 'max')),
  planned_duration_min  integer check (planned_duration_min >= 0),
  planned_distance_m    integer check (planned_distance_m >= 0),
  status                text not null default 'planned'
                          check (status in ('planned', 'completed', 'missed', 'skipped', 'moved')),
  position              integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.sessions is 'A single planned session on a date.';
comment on column public.sessions.description is
  'PRIVATE plan content. Never exposed to coaches, other athletes or share cards.';

create index sessions_user_id_idx on public.sessions (user_id);
create index sessions_block_id_idx on public.sessions (block_id);
create index sessions_week_id_idx on public.sessions (week_id);
create index sessions_user_scheduled_date_idx on public.sessions (user_id, scheduled_date);

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- session_logs
-- ---------------------------------------------------------------------------

create table public.session_logs (
  id                   uuid primary key default extensions.gen_random_uuid(),
  user_id              uuid not null references public.users (id) on delete cascade,
  -- Null session_id leaves room for logging an unplanned session later.
  session_id           uuid references public.sessions (id) on delete cascade,
  completed_at         timestamptz not null default now(),
  actual_duration_min  integer check (actual_duration_min >= 0),
  actual_distance_m    integer check (actual_distance_m >= 0),
  rpe                  integer check (rpe between 1 and 10),
  notes                text,
  source               text not null default 'manual'
                         check (source in ('manual', 'strava', 'garmin', 'apple_health')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.session_logs is 'What the athlete actually did.';
comment on column public.session_logs.notes is
  'PRIVATE. Never exposed to coaches, other athletes or share cards.';

create index session_logs_user_id_idx on public.session_logs (user_id);
create index session_logs_session_id_idx on public.session_logs (session_id);
create index session_logs_user_completed_at_idx on public.session_logs (user_id, completed_at desc);

create trigger session_logs_set_updated_at
  before update on public.session_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- weekly_summaries  (written only by Edge Functions via the service role)
-- ---------------------------------------------------------------------------

create table public.weekly_summaries (
  id                  uuid primary key default extensions.gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  block_id            uuid references public.training_blocks (id) on delete set null,
  week_id             uuid references public.weeks (id) on delete set null,
  week_start          date not null,
  stryder_score       integer check (stryder_score between 0 and 100),
  sessions_planned    integer not null default 0 check (sessions_planned >= 0),
  sessions_completed  integer not null default 0 check (sessions_completed >= 0),
  summary_text        text,
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, week_start)
);

comment on table public.weekly_summaries is
  'The Monday morning summary. Athlete-readable; written only by the service role.';

create index weekly_summaries_user_week_idx on public.weekly_summaries (user_id, week_start desc);

create trigger weekly_summaries_set_updated_at
  before update on public.weekly_summaries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- streaks
-- ---------------------------------------------------------------------------

create table public.streaks (
  id               uuid primary key default extensions.gen_random_uuid(),
  user_id          uuid not null unique references public.users (id) on delete cascade,
  current_streak   integer not null default 0 check (current_streak >= 0),
  longest_streak   integer not null default 0 check (longest_streak >= 0),
  last_active_week date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.streaks is 'Consecutive compliant weeks, one row per athlete.';

create trigger streaks_set_updated_at
  before update on public.streaks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- badges  (awarded only by Edge Functions via the service role)
-- ---------------------------------------------------------------------------

create table public.badges (
  id          uuid primary key default extensions.gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  badge_key   text not null,
  awarded_at  timestamptz not null default now(),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, badge_key)
);

comment on table public.badges is
  'Earned badges. Athlete-readable; awarded only by the service role.';

create index badges_user_id_idx on public.badges (user_id);

create trigger badges_set_updated_at
  before update on public.badges
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Keep denormalised user_id honest
-- ---------------------------------------------------------------------------
-- weeks.user_id and sessions.user_id must match the owner of the parent block,
-- otherwise a client could park a row under another athlete's block.

create or replace function public.assert_block_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  block_owner uuid;
begin
  select tb.user_id into block_owner
  from public.training_blocks tb
  where tb.id = new.block_id;

  if block_owner is null then
    raise exception 'training block % does not exist', new.block_id
      using errcode = 'foreign_key_violation';
  end if;

  if block_owner <> new.user_id then
    raise exception 'user_id must match the owner of the parent training block'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger weeks_user_matches_block
  before insert or update on public.weeks
  for each row execute function public.assert_block_owner();

create trigger sessions_user_matches_block
  before insert or update on public.sessions
  for each row execute function public.assert_block_owner();
