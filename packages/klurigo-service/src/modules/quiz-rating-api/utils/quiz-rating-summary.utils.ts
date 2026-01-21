import { QuizRatingSummary } from '../../quiz-core/repositories/models/schemas'

type Star = 1 | 2 | 3 | 4 | 5
type StarKey = '1' | '2' | '3' | '4' | '5'

/**
 * Updates a quiz rating summary based on a rating change.
 *
 * Supported flows:
 * - Create: `previousStars` is undefined and `nextStars` is provided.
 * - Update: both `previousStars` and `nextStars` are provided (and may differ).
 * - No-op: neither stars nor comment presence changed (common when only `updatedAt` changes).
 *
 * Notes:
 * - Star inputs are clamped to 1..5.
 * - Bucket counts never underflow below 0.
 * - `count` and `avg` are recomputed from buckets, and `avg` is rounded to 1 decimal.
 * - `commentCount` tracks how many ratings include a non-empty comment.
 *
 * @param args - Arguments describing the summary update:
 * - `summary`: the current rating summary.
 * - `previousStars`: the previous star value, if an existing rating is being updated.
 * - `nextStars`: the new star value.
 * - `previousComment`: the previous comment value, used to track comment presence changes.
 * - `nextComment`: the new comment value, used to track comment presence changes.
 * - `updatedAt`: optional timestamp for the summary `updated` field.
 * @returns The updated rating summary, with updated star buckets, `count`, `avg`, `commentCount`, and `updated`.
 */
export function updateQuizRatingSummary(args: {
  summary: QuizRatingSummary
  previousStars?: number
  nextStars: number
  previousComment?: string | null
  nextComment?: string | null
  updatedAt?: Date
}): QuizRatingSummary {
  const updatedAt = args.updatedAt ?? new Date()

  const prevStars =
    args.previousStars == null ? undefined : clampStars(args.previousStars)
  const nextStars = clampStars(args.nextStars)

  const prevHasComment = hasComment(args.previousComment)
  const nextHasComment = hasComment(args.nextComment)

  const starsChanged = prevStars !== nextStars
  const commentPresenceChanged = prevHasComment !== nextHasComment

  if (!starsChanged && !commentPresenceChanged) {
    return {
      ...args.summary,
      updated: updatedAt,
    }
  }

  const stars = { ...args.summary.stars }
  let commentCount = args.summary.commentCount ?? 0

  // Comment count delta (presence-based)
  if (commentPresenceChanged) {
    commentCount += nextHasComment ? 1 : -1
    commentCount = Math.max(0, commentCount)
  }

  // Stars create/update
  if (starsChanged) {
    if (prevStars == null) {
      // Create: add one rating to next bucket
      incrementBucket(stars, nextStars)

      const { count, avg } = computeCountAndAvgFromBuckets(stars)

      return {
        count,
        avg,
        stars,
        commentCount,
        updated: updatedAt,
      }
    }

    // Update: move one rating between buckets
    decrementBucket(stars, prevStars)
    incrementBucket(stars, nextStars)
  }

  const { count, avg } = computeCountAndAvgFromBuckets(stars)

  return {
    count,
    avg,
    stars,
    commentCount,
    updated: updatedAt,
  }
}

/**
 * Clamps a star value to the supported rating range (1–5).
 *
 * @param value - The star value to clamp.
 * @returns A star value within the inclusive range 1–5.
 */
function clampStars(value: number): Star {
  if (value <= 1) return 1
  if (value >= 5) return 5
  return value as Star
}

/**
 * Converts a numeric star value to its corresponding bucket key.
 *
 * @param star - The star value (1–5).
 * @returns The bucket key representing the star value (`'1'`..`'5'`).
 */
function toStarKey(star: Star): StarKey {
  return String(star) as StarKey
}

/**
 * Increments the bucket count for a given star value.
 *
 * @param stars - The star distribution buckets to mutate.
 * @param star - The star bucket to increment.
 */
function incrementBucket(stars: QuizRatingSummary['stars'], star: Star): void {
  const key = toStarKey(star)
  stars[key] = (stars[key] ?? 0) + 1
}

/**
 * Decrements the bucket count for a given star value.
 *
 * Bucket values are clamped to never underflow below 0.
 *
 * @param stars - The star distribution buckets to mutate.
 * @param star - The star bucket to decrement.
 */
function decrementBucket(stars: QuizRatingSummary['stars'], star: Star): void {
  const key = toStarKey(star)
  stars[key] = Math.max(0, (stars[key] ?? 0) - 1)
}

/**
 * Checks whether a comment value should be counted as a comment.
 *
 * A comment counts as present when it contains at least one non-whitespace character.
 *
 * @param value - The comment value to evaluate.
 * @returns `true` if the comment is non-empty after trimming; otherwise `false`.
 */
function hasComment(value?: string | null): boolean {
  return (value ?? '').trim().length > 0
}

/**
 * Computes the total rating count and the average rating from a star distribution.
 *
 * - `count` is the sum of all bucket values.
 * - `avg` is the weighted mean rounded to 1 decimal.
 * - Returns `{count: 0, avg: 0}` when there are no ratings.
 *
 * @param stars - The star distribution buckets (`'1'`..`'5'`).
 * @returns An object containing:
 * - `count`: the total number of ratings across all buckets.
 * - `avg`: the weighted mean star rating rounded to 1 decimal.
 */
function computeCountAndAvgFromBuckets(stars: Record<StarKey, number>): {
  count: number
  avg: number
} {
  const c1 = stars['1'] ?? 0
  const c2 = stars['2'] ?? 0
  const c3 = stars['3'] ?? 0
  const c4 = stars['4'] ?? 0
  const c5 = stars['5'] ?? 0

  const count = c1 + c2 + c3 + c4 + c5
  if (count === 0) {
    return { count: 0, avg: 0 }
  }

  const sum = 1 * c1 + 2 * c2 + 3 * c3 + 4 * c4 + 5 * c5
  const avg = Math.round((sum / count) * 10) / 10

  return { count, avg }
}
