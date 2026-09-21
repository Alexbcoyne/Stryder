/**
 * Domain types.
 *
 * The generated row types in `./database` are the wire shape: enumerated
 * columns arrive as plain `string` because they are CHECK constraints, not
 * Postgres enums. These types narrow them to the unions in `@stryder/constants`
 * so the rest of the codebase works with real unions.
 *
 * Narrowing happens at the edge (in `@stryder/api` queries), never by casting
 * in a component.
 */

import type {
  BlockPhase,
  BlockStatus,
  Intensity,
  LogSource,
  PlanSource,
  ScoreBandId,
  SessionStatus,
  SessionType,
  Sport,
  Tier,
  UserRole,
} from '@stryder/constants';

import type { Tables } from './database';

/** An ISO 8601 date with no time component, e.g. `2026-03-14`. */
export type IsoDate = string;
/** An ISO 8601 timestamp with timezone. */
export type IsoTimestamp = string;

export type Profile = Omit<Tables<'users'>, 'role' | 'tier'> & {
  role: UserRole;
  tier: Tier;
};

export type Block = Omit<Tables<'training_blocks'>, 'sport' | 'status' | 'source'> & {
  sport: Sport;
  status: BlockStatus;
  source: PlanSource;
};

export type Week = Omit<Tables<'weeks'>, 'phase'> & {
  phase: BlockPhase | null;
};

export type Session = Omit<Tables<'sessions'>, 'session_type' | 'status' | 'intensity'> & {
  session_type: SessionType;
  status: SessionStatus;
  intensity: Intensity | null;
};

export type SessionLog = Omit<Tables<'session_logs'>, 'source'> & {
  source: LogSource;
};

export type WeeklySummary = Tables<'weekly_summaries'>;
export type Streak = Tables<'streaks'>;
export type Badge = Tables<'badges'>;

/**
 * A resolved Stryder Score band.
 *
 * Produced by `scoreBand()` in `@stryder/utils` — the only supported way to go
 * from a score to a band.
 */
export interface ScoreBand {
  readonly id: ScoreBandId;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly color: string;
  readonly cssVar: string;
}

/**
 * Compliance metrics. This is the ONLY shape that may ever leave the athlete's
 * own context — to a coach, to a share card, or anywhere else. It deliberately
 * contains no session titles, descriptions, notes or imported plan text.
 *
 * Stryder shares compliance, never content.
 */
export interface ComplianceMetrics {
  readonly weekStart: IsoDate;
  readonly stryderScore: number;
  readonly sessionsPlanned: number;
  readonly sessionsCompleted: number;
}
