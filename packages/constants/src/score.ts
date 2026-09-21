/**
 * Stryder Score bands.
 *
 * Supersedes the 75/60 bands in the Technical Spec: the updated colour system
 * (90 / 80 / 65) is authoritative.
 *
 * These colours belong to the score and nothing else. Generic success and error
 * states use the semantic tokens instead — see apps/web/app/globals.css.
 */

export const SCORE_BANDS = ['elite', 'on_track', 'building', 'needs_attention'] as const;
export type ScoreBandId = (typeof SCORE_BANDS)[number];

export interface ScoreBandDefinition {
  readonly id: ScoreBandId;
  readonly label: string;
  /** Inclusive lower bound of the band, 0-100. */
  readonly min: number;
  /** Inclusive upper bound of the band, 0-100. */
  readonly max: number;
  readonly color: string;
  /** CSS custom property exposing the same colour to the web app. */
  readonly cssVar: string;
}

/** Ordered highest band first. */
export const SCORE_BAND_DEFINITIONS: readonly ScoreBandDefinition[] = [
  {
    id: 'elite',
    label: 'Elite',
    min: 90,
    max: 100,
    color: '#39FF14',
    cssVar: '--score-elite',
  },
  {
    id: 'on_track',
    label: 'On Track',
    min: 80,
    max: 89,
    color: '#F4C542',
    cssVar: '--score-on-track',
  },
  {
    id: 'building',
    label: 'Building',
    min: 65,
    max: 79,
    color: '#FF8C42',
    cssVar: '--score-building',
  },
  {
    id: 'needs_attention',
    label: 'Needs Attention',
    min: 0,
    max: 64,
    color: '#FF5F1F',
    cssVar: '--score-needs-attention',
  },
] as const;

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;
