/**
 * Formats a past date as a human-friendly relative time string.
 *
 * Buckets (approximate):
 * - < 60 seconds  → "Just now"
 * - < 60 minutes  → "N minute(s) ago"
 * - < 24 hours    → "N hour(s) ago"
 * - < 30 days     → "N day(s) ago"
 * - < 12 months   → "N month(s) ago"   (30-day months)
 * - otherwise     → "N year(s) ago"    (365-day years)
 *
 * Notes:
 * - Accepts a `Date` or an ISO-compatible date string.
 * - Uses the current system time to compute the difference.
 * - If `date` cannot be parsed (e.g., `undefined` or invalid string), the math
 *   will yield `NaN` and the function will currently return the string
 *   `"NaN years ago"`. Consider guarding inputs upstream if needed.
 *
 * @param date A `Date` instance or ISO-like string representing a past time.
 * @returns A relative time string such as "Just now", "5 minutes ago", etc.
 */
export function formatTimeAgo(date?: Date | string): string {
  const time = (
    date instanceof Date ? date : new Date(date as string)
  ).getTime()

  const now = new Date()
  const seconds = Math.floor((now.getTime() - time) / 1000)

  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) {
    return 'Just now'
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ago`
  }
}
