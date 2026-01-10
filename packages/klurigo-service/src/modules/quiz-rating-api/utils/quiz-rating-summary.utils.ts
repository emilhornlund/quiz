import { QuizRatingSummary } from '../../quiz-core/repositories/models/schemas'

/**
 * Updates a quiz rating summary based on a rating change.
 *
 * Supported flows:
 * - Create: `previousStars` is undefined and `nextStars` is provided.
 * - Update: both `previousStars` and `nextStars` are provided (and may differ).
 * - No-op: stars did not change (common when only the comment is updated).
 *
 * Notes:
 * - Star inputs are clamped to 1..5.
 * - Bucket counts never underflow below 0.
 * - `avg` is recomputed from buckets and rounded to 1 decimal.
 */
export function updateQuizRatingSummary(args: {
  summary: QuizRatingSummary
  previousStars?: number
  nextStars: number
  updatedAt?: Date
}): QuizRatingSummary {
  const updatedAt = args.updatedAt ?? new Date()

  const clampStars = (value: number): 1 | 2 | 3 | 4 | 5 => {
    if (value <= 1) return 1
    if (value >= 5) return 5
    return value as 1 | 2 | 3 | 4 | 5
  }

  const prev =
    args.previousStars == null ? undefined : clampStars(args.previousStars)
  const next = clampStars(args.nextStars)

  // No-op if stars didn't change (typical: comment-only update)
  if (prev === next) {
    return {
      ...args.summary,
      updated: updatedAt,
    }
  }

  const stars = { ...args.summary.stars }

  // Create path: increment count and bucket
  if (prev == null) {
    const nextKey = String(next) as keyof QuizRatingSummary['stars']
    stars[nextKey] = (stars[nextKey] ?? 0) + 1

    const count = (args.summary.count ?? 0) + 1
    const { avg } = computeCountAndAvgFromBuckets(stars)

    return {
      count,
      avg,
      stars,
      updated: updatedAt,
    }
  }

  // Update path: move one bucket entry between stars
  const prevKey = String(prev) as keyof QuizRatingSummary['stars']
  const nextKey = String(next) as keyof QuizRatingSummary['stars']

  stars[prevKey] = Math.max(0, (stars[prevKey] ?? 0) - 1)
  stars[nextKey] = (stars[nextKey] ?? 0) + 1

  const { count, avg } = computeCountAndAvgFromBuckets(stars)

  return {
    count,
    avg,
    stars,
    updated: updatedAt,
  }
}

/**
 * Computes the total rating count and the average rating from a star distribution.
 *
 * - `count` is the sum of all bucket values.
 * - `avg` is the weighted mean rounded to 1 decimal.
 * - Returns `{count: 0, avg: 0}` when there are no ratings.
 */
function computeCountAndAvgFromBuckets(
  stars: Record<'1' | '2' | '3' | '4' | '5', number>,
): { count: number; avg: number } {
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
