/**
 * Sports, session types, phases and intensities.
 *
 * These lists mirror the CHECK constraints in
 * `supabase/migrations/20260921100100_m2_core_tables.sql`. If you change one,
 * change the other in the same commit — the database is the enforcement point,
 * this package is the typed mirror of it.
 */

export const SPORTS = [
  'running',
  'triathlon',
  'cycling',
  'swimming',
  'hyrox',
  'rugby',
  'gaa',
  'strength',
  'other',
] as const;

export type Sport = (typeof SPORTS)[number];

export const SPORT_LABELS: Record<Sport, string> = {
  running: 'Running',
  triathlon: 'Triathlon',
  cycling: 'Cycling',
  swimming: 'Swimming',
  hyrox: 'Hyrox',
  rugby: 'Rugby',
  gaa: 'GAA',
  strength: 'Strength',
  other: 'Other',
};

export const SESSION_TYPES = [
  'run',
  'ride',
  'swim',
  'brick',
  'gym',
  'hyrox',
  'rugby_training',
  'gaa_training',
  'match',
  'mobility',
  'physio',
  'rest',
  'other',
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  run: 'Run',
  ride: 'Ride',
  swim: 'Swim',
  brick: 'Brick',
  gym: 'Gym',
  hyrox: 'Hyrox',
  rugby_training: 'Rugby training',
  gaa_training: 'GAA training',
  match: 'Match',
  mobility: 'Mobility',
  physio: 'Physio',
  rest: 'Rest',
  other: 'Other',
};

/** Session types that carry no training load and never count against compliance. */
export const NON_TRAINING_SESSION_TYPES = ['rest'] as const satisfies readonly SessionType[];

export const BLOCK_PHASES = ['base', 'build', 'peak', 'taper'] as const;
export type BlockPhase = (typeof BLOCK_PHASES)[number];

export const PHASE_LABELS: Record<BlockPhase, string> = {
  base: 'Base',
  build: 'Build',
  peak: 'Peak',
  taper: 'Taper',
};

export const INTENSITIES = ['easy', 'moderate', 'hard', 'max'] as const;
export type Intensity = (typeof INTENSITIES)[number];

export const INTENSITY_LABELS: Record<Intensity, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  max: 'Max',
};

export const SESSION_STATUSES = ['planned', 'completed', 'missed', 'skipped', 'moved'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  planned: 'Planned',
  completed: 'Completed',
  missed: 'Missed',
  skipped: 'Skipped',
  moved: 'Moved',
};

export const BLOCK_STATUSES = ['draft', 'active', 'completed', 'archived'] as const;
export type BlockStatus = (typeof BLOCK_STATUSES)[number];

/** Where a plan came from. Stryder imports plans; it never generates them. */
export const PLAN_SOURCES = ['manual', 'ical', 'pdf', 'template'] as const;
export type PlanSource = (typeof PLAN_SOURCES)[number];

/** Where a completed-session log came from. */
export const LOG_SOURCES = ['manual', 'strava', 'garmin', 'apple_health'] as const;
export type LogSource = (typeof LOG_SOURCES)[number];

export const USER_ROLES = ['athlete', 'coach'] as const;
export type UserRole = (typeof USER_ROLES)[number];
