-- Athlete A must not be able to read or modify any of athlete B's rows.
-- Non-negotiable rule 1 (plan content is private) and rule 2 (RLS everywhere).
begin;
create extension if not exists pgtap;
select plan(29);

-- ---------------------------------------------------------------------------
-- Every table carries RLS.
-- ---------------------------------------------------------------------------
select ok(
  (select relrowsecurity from pg_class where oid = ('public.' || t)::regclass),
  format('RLS is enabled on public.%s', t)
)
from unnest(array[
  'users', 'training_blocks', 'weeks', 'sessions',
  'session_logs', 'weekly_summaries', 'streaks', 'badges'
]) as t;

-- ---------------------------------------------------------------------------
-- Fixtures: athlete A owns a full plan; athlete B owns nothing.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@stryder.test'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@stryder.test');

insert into public.training_blocks (id, user_id, name, start_date, end_date)
values ('a0000000-0000-0000-0000-000000000001',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Dublin Marathon', current_date, current_date + 84);

insert into public.weeks (id, user_id, block_id, week_number, start_date, notes)
values ('a0000000-0000-0000-0000-000000000002',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'a0000000-0000-0000-0000-000000000001',
        1, current_date, 'private coach note');

insert into public.sessions (id, user_id, block_id, week_id, scheduled_date, session_type, description)
values ('a0000000-0000-0000-0000-000000000003',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'a0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002',
        current_date, 'run', '6x800m @ 5k pace');

insert into public.session_logs (id, user_id, session_id, rpe, notes)
values ('a0000000-0000-0000-0000-000000000004',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'a0000000-0000-0000-0000-000000000003', 7, 'legs felt heavy');

insert into public.weekly_summaries (user_id, week_start, stryder_score, summary_text)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date, 92, 'Strong week.');

insert into public.streaks (user_id, current_streak, longest_streak)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 9);

insert into public.badges (user_id, badge_key)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'first_block');

-- ---------------------------------------------------------------------------
-- Act as athlete B.
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';

select is((select count(*)::int from public.users where id <> 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
          0, 'B cannot read A''s profile');
select is((select count(*)::int from public.training_blocks), 0, 'B cannot read A''s training blocks');
select is((select count(*)::int from public.weeks), 0, 'B cannot read A''s weeks');
select is((select count(*)::int from public.sessions), 0, 'B cannot read A''s sessions');
select is((select count(*)::int from public.session_logs), 0, 'B cannot read A''s session logs');
select is((select count(*)::int from public.weekly_summaries), 0, 'B cannot read A''s weekly summaries');
select is((select count(*)::int from public.streaks), 0, 'B cannot read A''s streaks');
select is((select count(*)::int from public.badges), 0, 'B cannot read A''s badges');

-- Plan content specifically: the private columns are unreachable, not merely unselected.
select is((select count(*)::int from public.sessions where description is not null),
          0, 'B cannot read A''s session descriptions (plan content stays private)');
select is((select count(*)::int from public.weeks where notes is not null),
          0, 'B cannot read A''s week notes (plan content stays private)');

-- Writes against A's rows are no-ops: RLS filters them out of the update/delete set.
update public.training_blocks set name = 'hijacked';
select is((select count(*)::int from public.training_blocks where name = 'hijacked'),
          0, 'B cannot update A''s training blocks');
update public.sessions set status = 'completed';
select is((select count(*)::int from public.sessions where status = 'completed'),
          0, 'B cannot update A''s sessions');
delete from public.session_logs;
delete from public.weeks;
delete from public.sessions;
delete from public.training_blocks;

-- Writes claiming A's user_id are rejected outright by the WITH CHECK clause.
select throws_ok(
  $$insert into public.training_blocks (user_id, name, start_date, end_date)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'smuggled', current_date, current_date + 7)$$,
  '42501',
  null,
  'B cannot insert a training block owned by A'
);

select throws_ok(
  $$insert into public.sessions (user_id, block_id, scheduled_date, session_type)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'a0000000-0000-0000-0000-000000000001', current_date, 'run')$$,
  '42501',
  null,
  'B cannot insert a session owned by A'
);

select throws_ok(
  $$insert into public.session_logs (user_id, rpe) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5)$$,
  '42501',
  null,
  'B cannot insert a session log owned by A'
);

select throws_ok(
  $$insert into public.streaks (user_id, current_streak) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 99)$$,
  '42501',
  null,
  'B cannot insert a streak owned by A'
);

-- ---------------------------------------------------------------------------
-- A still sees everything of their own.
-- ---------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';

select is((select count(*)::int from public.training_blocks), 1, 'A reads their own training block');
select is((select count(*)::int from public.sessions), 1, 'A reads their own session');
select is((select description from public.sessions limit 1),
          '6x800m @ 5k pace', 'A reads their own plan content');
select is((select count(*)::int from public.weekly_summaries), 1, 'A reads their own weekly summary');
select is((select count(*)::int from public.badges), 1, 'A reads their own badges');

reset role;
select * from finish();
rollback;
