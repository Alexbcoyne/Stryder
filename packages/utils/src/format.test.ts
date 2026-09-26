import { describe, expect, it } from 'vitest';

import { formatDistanceMeters, formatDurationMinutes } from './format';

describe('formatDurationMinutes', () => {
  it('returns null for null or undefined', () => {
    expect(formatDurationMinutes(null)).toBeNull();
    expect(formatDurationMinutes(undefined)).toBeNull();
  });

  it('formats under an hour in minutes', () => {
    expect(formatDurationMinutes(0)).toBe('0 min');
    expect(formatDurationMinutes(45)).toBe('45 min');
    expect(formatDurationMinutes(59)).toBe('59 min');
  });

  it('formats an exact hour with no minutes', () => {
    expect(formatDurationMinutes(60)).toBe('1h');
    expect(formatDurationMinutes(120)).toBe('2h');
  });

  it('formats hours and minutes together', () => {
    expect(formatDurationMinutes(90)).toBe('1h 30m');
    expect(formatDurationMinutes(135)).toBe('2h 15m');
  });
});

describe('formatDistanceMeters', () => {
  it('returns null for null or undefined', () => {
    expect(formatDistanceMeters(null)).toBeNull();
    expect(formatDistanceMeters(undefined)).toBeNull();
  });

  it('formats under a kilometre in metres', () => {
    expect(formatDistanceMeters(0)).toBe('0 m');
    expect(formatDistanceMeters(800)).toBe('800 m');
    expect(formatDistanceMeters(999)).toBe('999 m');
  });

  it('formats a round number of kilometres with no decimal', () => {
    expect(formatDistanceMeters(1000)).toBe('1 km');
    expect(formatDistanceMeters(10000)).toBe('10 km');
  });

  it('formats a fractional kilometre distance to one decimal', () => {
    expect(formatDistanceMeters(10200)).toBe('10.2 km');
    expect(formatDistanceMeters(1500)).toBe('1.5 km');
  });

  it('rounds to the nearest one decimal place', () => {
    expect(formatDistanceMeters(10240)).toBe('10.2 km');
    expect(formatDistanceMeters(10260)).toBe('10.3 km');
  });
});
