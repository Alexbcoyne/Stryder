-- weekly_summaries and badges are produced by Edge Functions running as the
-- service role. The client can read its own rows and nothing else.
begin;
create extension if not exists pgtap;
select plan(8);

insert into auth.users (id, email)
values ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'writer@stryder.test');

-- No write policies exist on these two tables at all.
select is(
  (select count(*)::int from pg_policies
   where schemaname = 'public' and tablename = 'weekly_summaries' and cmd <> 'SELECT'),
  0,
  'weekly_summaries has no client write policy'
);
select is(
  (select count(*)::int from pg_policies
   where schemaname = 'public' and tablename = 'badges' and cmd <> 'SELECT'),
  0,
  'badges has no client write policy'
);

insert into public.weekly_summaries (user_id, week_start, stryder_score)
values ('ffffffff-ffff-ffff-ffff-ffffffffffff', current_date, 88);
insert into public.badges (user_id, badge_key)
values ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'consistency_4');

set local role authenticated;
set local request.jwt.claims to '{"sub":"ffffffff-ffff-ffff-ffff-ffffffffffff","role":"authenticated"}';

select is((select count(*)::int from public.weekly_summaries), 1,
          'the athlete reads their own weekly summary');
select is((select count(*)::int from public.badges), 1,
          'the athlete reads their own badges');

select throws_ok(
  $$insert into public.weekly_summaries (user_id, week_start, stryder_score)
    values ('ffffffff-ffff-ffff-ffff-ffffffffffff', current_date + 7, 100)$$,
  '42501',
  null,
  'the client cannot insert a weekly summary'
);

select throws_ok(
  $$insert into public.badges (user_id, badge_key)
    values ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'self_awarded')$$,
  '42501',
  null,
  'the client cannot insert a badge'
);

select throws_ok(
  $$update public.weekly_summaries set stryder_score = 100$$,
  '42501',
  null,
  'the client cannot inflate its own Stryder Score'
);

select throws_ok(
  $$delete from public.badges$$,
  '42501',
  null,
  'the client cannot delete its own badges'
);

reset role;
select * from finish();
rollback;
