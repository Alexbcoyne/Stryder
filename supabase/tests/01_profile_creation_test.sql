-- A new auth user gets a public.users profile and a 30-day reverse trial.
begin;
create extension if not exists pgtap;
select plan(9);

-- ---------------------------------------------------------------------------
select has_table('public', 'users', 'public.users exists');
select has_function('public', 'handle_new_user', 'signup trigger function exists');
select has_trigger('auth', 'users', 'on_auth_user_created', 'auth.users has the signup trigger');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111111',
  'athlete@stryder.test',
  '{"full_name": "Test Athlete", "avatar_url": "https://example.test/a.png"}'::jsonb
);

select is(
  (select count(*)::int from public.users where id = '11111111-1111-1111-1111-111111111111'),
  1,
  'signup creates exactly one profile row'
);

select is(
  (select email from public.users where id = '11111111-1111-1111-1111-111111111111'),
  'athlete@stryder.test',
  'profile carries the auth email'
);

select is(
  (select full_name from public.users where id = '11111111-1111-1111-1111-111111111111'),
  'Test Athlete',
  'profile picks up full_name from user metadata'
);

select is(
  (select tier from public.users where id = '11111111-1111-1111-1111-111111111111'),
  'free',
  'new athletes start on the free tier'
);

-- 30-day reverse trial, no card. Allow a day of slack either side.
select ok(
  (select trial_ends_at from public.users where id = '11111111-1111-1111-1111-111111111111')
    between now() + interval '29 days' and now() + interval '31 days',
  'signup opens a 30-day reverse trial'
);

-- During the trial a free-tier user has athlete entitlements.
select is(
  public.effective_tier('11111111-1111-1111-1111-111111111111'),
  'athlete',
  'effective_tier upgrades a trialling free user to athlete'
);

select * from finish();
rollback;
