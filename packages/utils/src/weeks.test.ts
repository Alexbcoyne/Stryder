import { describe, expect, it } from 'vitest';

import { weekCountForBlock, weekNumberForDate, weekStartDateForNumber } from './weeks';

describe('weekNumberForDate', () => {
  it('puts the start date itself in week 1', () => {
    expect(weekNumberForDate('2026-01-05', '2026-01-05')).toBe(1);
  });

  it('keeps the first 7 days in week 1', () => {
    expect(weekNumberForDate('2026-01-05', '2026-01-11')).toBe(1);
  });

  it('rolls into week 2 on day 8', () => {
    expect(weekNumberForDate('2026-01-05', '2026-01-12')).toBe(2);
  });

  it('handles a week boundary crossing a month', () => {
    expect(weekNumberForDate('2026-01-26', '2026-02-02')).toBe(2);
  });

  it('rejects a date before the block starts', () => {
    expect(() => weekNumberForDate('2026-01-05', '2026-01-04')).toThrow(RangeError);
  });

  it('rejects an invalid date string', () => {
    expect(() => weekNumberForDate('2026-01-05', 'not-a-date')).toThrow(TypeError);
  });
});

describe('weekStartDateForNumber', () => {
  it('returns the block start date for week 1', () => {
    expect(weekStartDateForNumber('2026-01-05', 1)).toBe('2026-01-05');
  });

  it('adds 7 days per week', () => {
    expect(weekStartDateForNumber('2026-01-05', 2)).toBe('2026-01-12');
    expect(weekStartDateForNumber('2026-01-05', 3)).toBe('2026-01-19');
  });

  it('rejects a non-positive week number', () => {
    expect(() => weekStartDateForNumber('2026-01-05', 0)).toThrow(RangeError);
    expect(() => weekStartDateForNumber('2026-01-05', -1)).toThrow(RangeError);
  });

  it('rejects a fractional week number', () => {
    expect(() => weekStartDateForNumber('2026-01-05', 1.5)).toThrow(RangeError);
  });

  it('round-trips with weekNumberForDate', () => {
    const start = '2026-03-02';
    for (let week = 1; week <= 12; week += 1) {
      const weekStart = weekStartDateForNumber(start, week);
      expect(weekNumberForDate(start, weekStart)).toBe(week);
    }
  });
});

describe('weekCountForBlock', () => {
  it('counts a single-week block as 1', () => {
    expect(weekCountForBlock('2026-01-05', '2026-01-11')).toBe(1);
  });

  it('counts a 16-week marathon block', () => {
    // 16 weeks * 7 days - 1 day, from the start date.
    expect(weekCountForBlock('2026-01-05', '2026-04-25')).toBe(16);
  });

  it('counts a partial final week', () => {
    expect(weekCountForBlock('2026-01-05', '2026-01-12')).toBe(2);
  });
});
