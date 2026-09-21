-- M-3: entitlement helpers.
--
-- Tier gating is enforced here and in server code, never only in the frontend
-- (non-negotiable rule 3).

-- ---------------------------------------------------------------------------
-- effective_tier
-- ---------------------------------------------------------------------------
-- A user on `free` with an unexpired reverse trial gets `athlete` entitlements.
-- Everyone else gets the tier they are actually on.

create or replace function public.effective_tier(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
           when u.tier = 'free' and u.trial_ends_at is not null and u.trial_ends_at > now()
             then 'athlete'
           else u.tier
         end
  from public.users u
  where u.id = p_user_id;
$$;

comment on function public.effective_tier(uuid) is
  'Entitlement tier accounting for the 30-day reverse trial. Use this, never users.tier.';

revoke all on function public.effective_tier(uuid) from public;
grant execute on function public.effective_tier(uuid) to authenticated, service_role;
