/**
 * Formatting for planned/actual session numbers — the only place "meters" and
 * "minutes" become the strings a session row actually shows.
 */

/** `null`/`undefined` in, `null` out — the caller renders nothing rather than "—". */
export function formatDurationMinutes(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined) return null;
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/** Distances under 1km read better in metres than as "0.4 km". */
export function formatDistanceMeters(meters: number | null | undefined): string | null {
  if (meters === null || meters === undefined) return null;
  if (meters < 1000) return `${meters} m`;

  const km = meters / 1000;
  // One decimal place, but "10 km" rather than "10.0 km" for a round number.
  const rounded = Math.round(km * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} km`;
}
