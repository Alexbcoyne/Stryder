-- Free tier is limited to one active training block, enforced in the database.
-- Non-negotiable rule 3: tier gating never lives only in the frontend.
begin;
create extension if not exists pgtap;
select plan(9);

select has_function('public', 'effective_tier', array['uuid'], 'effective_tier(uuid) exists');
select has_function('public', 'enforce_free_tier_block_limit', 'block limit trigger function exists');
select has_trigger('public', 'training_blocks', 'training_blocks_free_tier_limit',
                   'training_blocks carries the free-tier limit trigger');

insert into auth.users (id, email) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'expired@stryder.test'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'trialling@stryder.test'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'paid@stryder.test');

-- Trial already over: genuinely on the free tier.
update public.users set trial_ends_at = now() - interval '1 day'
  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
-- Paid athlete.
update public.users set tier = 'athlete', trial_ends_at = now() - interval '1 day'
  where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

select is(public.effective_tier('cccccccc-cccc-cccc-cccc-cccccccccccc'), 'free',
          'an expired trial falls back to free');
select is(public.effective_tier('dddddddd-dddd-dddd-dddd-dddddddddddd'), 'athlete',
          'an open trial grants athlete entitlements');
select is(public.effective_tier('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'), 'athlete',
          'a paid athlete keeps their tier');

-- Free tier: first active block is fine, second is rejected.
insert into public.training_blocks (user_id, name, start_date, end_date)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Block one', current_date, current_date + 28);

select throws_ok(
  $$insert into public.training_blocks (user_id, name, start_date, end_date)
    values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Block two', current_date, current_date + 28)$$,
  'Free tier is limited to one active training block. Archive the current block or upgrade.',
  'free tier cannot open a second active block'
);

-- Archiving the first frees the slot.
update public.training_blocks set status = 'archived'
  where user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
insert into public.training_blocks (user_id, name, start_date, end_date)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Block two', current_date, current_date + 28);
select is(
  (select count(*)::int from public.training_blocks
   where user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' and status = 'active'),
  1,
  'archiving the active block frees the free-tier slot'
);

-- Trialling and paid users are not limited.
insert into public.training_blocks (user_id, name, start_date, end_date) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Trial block one', current_date, current_date + 28),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Trial block two', current_date, current_date + 28);
select is(
  (select count(*)::int from public.training_blocks
   where user_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' and status = 'active'),
  2,
  'a trialling user may hold more than one active block'
);

select * from finish();
rollback;
