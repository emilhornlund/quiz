import { format } from 'date-fns'

/**
 * Canonical date/time format patterns used throughout the UI.
 *
 * These formats are intended for rendering dates in the browser's
 * local timezone (i.e., the current environment timezone).
 */
export const DATE_FORMATS = {
  DATE_TIME: 'yyyy-LL-dd HH:mm',
  DATE_TIME_SECONDS: 'yyyy-LL-dd HH:mm:ss',
  DATE_ONLY: 'yyyy-LL-dd',
} as const

/**
 * Union type of all supported canonical date format patterns.
 *
 * Use this type to constrain formatting helpers to the patterns
 * defined in `DATE_FORMATS`, ensuring consistent UI rendering.
 */
export type DateFormatPattern = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS]

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

/**
 * Formats a UTC timestamp for display in the browser's local timezone.
 *
 * Accepts either a Date instance or an ISO 8601 date string.
 * The input value is assumed to represent a UTC point in time
 * and is formatted using the environment's local timezone.
 *
 * @param value - UTC date value to format (Date instance or ISO 8601 string)
 * @param pattern - Canonical date format pattern used for rendering
 * @returns The formatted date string in the browser's local timezone
 */
export const formatLocalDate = (
  value: Date | string,
  pattern: DateFormatPattern,
): string => {
  const date = value instanceof Date ? value : new Date(value)

  return format(date, pattern)
}
