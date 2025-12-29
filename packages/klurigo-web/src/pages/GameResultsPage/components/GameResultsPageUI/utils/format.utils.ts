/**
 * Converts a duration in seconds to a rounded, human-readable format.
 *
 * @param seconds - The total duration in seconds.
 * @returns A formatted string, e.g., "2 hours, 5 minutes".
 */
export function formatRoundedDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const parts: string[] = []

  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  }

  return parts.join(', ')
}

/**
 * Converts a duration in milliseconds to a rounded string in seconds.
 *
 * @param milliseconds - The duration in milliseconds.
 * @returns A string like "2.5s" or "3s", depending on rounding.
 */
export function formatRoundedSeconds(milliseconds: number): string {
  const seconds = milliseconds / 1000
  const rounded = Math.round(seconds * 10) / 10
  return rounded % 1 === 0 ? `${rounded.toFixed(0)}s` : `${rounded.toFixed(1)}s`
}
