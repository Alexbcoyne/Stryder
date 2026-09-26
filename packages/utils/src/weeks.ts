/**
 * Pure date math for grouping sessions into weeks.
 *
 * A block's weeks are never entered by hand — they're derived from its start
 * date, so week 1 always starts on the block's own start date rather than the
 * calendar's Monday. This keeps onboarding to "when does the block start and
 * end", with weeks as an internal grouping the UI computes on the fly.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError(`Not a valid ISO date: ${date}`);
  }
  return parsed;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Which 1-indexed week of the block a date falls in.
 *
 * @throws RangeError if the date is before the block's start date.
 */
export function weekNumberForDate(blockStartDate: string, date: string): number {
  const start = parseIsoDate(blockStartDate);
  const target = parseIsoDate(date);

  const dayOffset = Math.floor((target.getTime() - start.getTime()) / DAY_MS);
  if (dayOffset < 0) {
    throw new RangeError(`${date} is before the block's start date ${blockStartDate}`);
  }

  return Math.floor(dayOffset / 7) + 1;
}

/** The calendar date week `weekNumber` (1-indexed) of the block starts on. */
export function weekStartDateForNumber(blockStartDate: string, weekNumber: number): string {
  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    throw new RangeError(`weekNumber must be a positive integer, received: ${weekNumber}`);
  }

  const start = parseIsoDate(blockStartDate);
  start.setUTCDate(start.getUTCDate() + (weekNumber - 1) * 7);

  return toIsoDate(start);
}

/** Total number of weeks a block spans, inclusive of a partial final week. */
export function weekCountForBlock(blockStartDate: string, blockEndDate: string): number {
  return weekNumberForDate(blockStartDate, blockEndDate);
}
