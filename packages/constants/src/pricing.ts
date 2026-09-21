/**
 * Tiers and pricing — the single source of truth.
 *
 * Annual prices follow the Decision Log (31 Aug): Athlete EUR 64/year,
 * Coach EUR 470/year. The Technical Spec's EUR 59 is superseded.
 *
 * Amounts are integer cents to keep them safe for Stripe and free of floating
 * point drift.
 */

export const TIERS = ['free', 'athlete', 'coach'] as const;
export type Tier = (typeof TIERS)[number];

export const CURRENCY = 'EUR' as const;

/** Length of the reverse trial. No card required; new users start on `free`. */
export const TRIAL_DAYS = 30;

/** Maximum athletes a coach may hold in their squads. */
export const COACH_ATHLETE_CAP = 20;

/** Active training blocks allowed on the free tier. Enforced in the database. */
export const FREE_TIER_ACTIVE_BLOCK_LIMIT = 1;

export interface TierPricing {
  readonly tier: Tier;
  readonly label: string;
  /** Monthly price in cents. */
  readonly monthlyCents: number;
  /** Annual price in cents. Null where the tier has no annual option. */
  readonly annualCents: number | null;
}

export const TIER_PRICING: Record<Tier, TierPricing> = {
  free: {
    tier: 'free',
    label: 'Free',
    monthlyCents: 0,
    annualCents: 0,
  },
  athlete: {
    tier: 'athlete',
    label: 'Athlete',
    monthlyCents: 700, // EUR 7 / month
    annualCents: 6400, // EUR 64 / year
  },
  coach: {
    tier: 'coach',
    label: 'Coach',
    monthlyCents: 4900, // EUR 49 / month
    annualCents: 47000, // EUR 470 / year
  },
};

/** Tier ordering, lowest to highest. Used for "does X satisfy Y" checks. */
export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  athlete: 1,
  coach: 2,
};

export function formatPriceCents(cents: number, locale = 'en-IE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
