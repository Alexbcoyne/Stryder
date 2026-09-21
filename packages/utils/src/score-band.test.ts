import { describe, expect, it } from 'vitest';

import { scoreBand, scoreBandOrNull } from './score-band';

describe('scoreBand', () => {
  describe('band boundaries', () => {
    it.each([
      [100, 'elite'],
      [95, 'elite'],
      [90, 'elite'],
      [89, 'on_track'],
      [85, 'on_track'],
      [80, 'on_track'],
      [79, 'building'],
      [70, 'building'],
      [65, 'building'],
      [64, 'needs_attention'],
      [30, 'needs_attention'],
      [0, 'needs_attention'],
    ])('scores %i as %s', (score, expected) => {
      expect(scoreBand(score).id).toBe(expected);
    });

    it('puts 64 and 65 in different bands', () => {
      expect(scoreBand(64).id).toBe('needs_attention');
      expect(scoreBand(65).id).toBe('building');
    });

    it('puts 79 and 80 in different bands', () => {
      expect(scoreBand(79).id).toBe('building');
      expect(scoreBand(80).id).toBe('on_track');
    });

    it('puts 89 and 90 in different bands', () => {
      expect(scoreBand(89).id).toBe('on_track');
      expect(scoreBand(90).id).toBe('elite');
    });
  });

  describe('band metadata', () => {
    it('returns the label and colour for the band', () => {
      expect(scoreBand(92)).toMatchObject({
        id: 'elite',
        label: 'Elite',
        color: '#39FF14',
        cssVar: '--score-elite',
      });
      expect(scoreBand(84).label).toBe('On Track');
      expect(scoreBand(84).color).toBe('#F4C542');
      expect(scoreBand(70).label).toBe('Building');
      expect(scoreBand(70).color).toBe('#FF8C42');
      expect(scoreBand(12).label).toBe('Needs Attention');
      expect(scoreBand(12).color).toBe('#FF5F1F');
    });
  });

  describe('fractional scores', () => {
    it('floors rather than rounds, so a score is never flattered', () => {
      expect(scoreBand(89.9).id).toBe('on_track');
      expect(scoreBand(64.99).id).toBe('needs_attention');
      expect(scoreBand(90.0).id).toBe('elite');
    });
  });

  describe('invalid input', () => {
    it.each([-1, -0.5, 101, 1000])('rejects out-of-range score %s', (score) => {
      expect(() => scoreBand(score)).toThrow(RangeError);
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      'rejects non-finite score %s',
      (score) => {
        expect(() => scoreBand(score)).toThrow(TypeError);
      },
    );

    it('rejects values that are not numbers at runtime', () => {
      // Callers are typed, but scores also arrive from the database and from
      // JSON, so the guard has to hold at runtime too.
      expect(() => scoreBand('90' as unknown as number)).toThrow(TypeError);
      expect(() => scoreBand(null as unknown as number)).toThrow(TypeError);
      expect(() => scoreBand(undefined as unknown as number)).toThrow(TypeError);
    });
  });
});

describe('scoreBandOrNull', () => {
  it('returns the band for a valid score', () => {
    expect(scoreBandOrNull(88)?.id).toBe('on_track');
  });

  it('returns null for an absent score', () => {
    expect(scoreBandOrNull(null)).toBeNull();
    expect(scoreBandOrNull(undefined)).toBeNull();
  });

  it('returns null rather than throwing for an invalid score', () => {
    expect(scoreBandOrNull(-5)).toBeNull();
    expect(scoreBandOrNull(Number.NaN)).toBeNull();
  });
});
