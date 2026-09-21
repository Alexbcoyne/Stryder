import { SCORE_BAND_DEFINITIONS, SCORE_MAX, SCORE_MIN } from '@stryder/constants';
import type { ScoreBand } from '@stryder/types';

/**
 * Resolve a Stryder Score (0-100) to its band.
 *
 * Bands: 90+ Elite, 80-89 On Track, 65-79 Building, 64 and below Needs
 * Attention. This is the only supported way to colour or label a score.
 *
 * Scores are whole numbers. A fractional input is floored, so 89.9 is still On
 * Track rather than being rounded up into Elite — a score is never flattered.
 *
 * @throws TypeError if the input is not a finite number.
 * @throws RangeError if the input is outside 0-100.
 */
export function scoreBand(score: number): ScoreBand {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    throw new TypeError(`Stryder Score must be a finite number, received: ${String(score)}`);
  }

  if (score < SCORE_MIN || score > SCORE_MAX) {
    throw new RangeError(
      `Stryder Score must be between ${SCORE_MIN} and ${SCORE_MAX}, received: ${score}`,
    );
  }

  const whole = Math.floor(score);
  const band = SCORE_BAND_DEFINITIONS.find((b) => whole >= b.min && whole <= b.max);

  /* c8 ignore next 5 -- unreachable: the bands cover 0-100 with no gaps. */
  if (!band) {
    throw new RangeError(`No score band covers ${score}. Score bands are misconfigured.`);
  }

  return band;
}

/**
 * Non-throwing variant for rendering paths where a score may legitimately be
 * absent (no summary yet) or has come from somewhere untrusted.
 */
export function scoreBandOrNull(score: number | null | undefined): ScoreBand | null {
  if (score === null || score === undefined) return null;

  try {
    return scoreBand(score);
  } catch {
    return null;
  }
}
