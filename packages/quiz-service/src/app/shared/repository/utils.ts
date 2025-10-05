import { PaginatedResult, PaginationOptions, SortOptions } from './types'

/**
 * Build pagination metadata from results
 */
export function buildPaginationMetadata<T>(
  documents: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const { skip = 0, limit = 10 } = options
  const page = Math.floor(skip / limit) + 1
  const totalPages = Math.ceil(total / limit)
  const hasNext = page * limit < total
  const hasPrev = page > 1

  return {
    documents,
    total,
    page,
    totalPages,
    hasNext,
    hasPrev,
  }
}

/**
 * Build sort object from sort options
 */
export function buildSortObject(
  sortOptions?: SortOptions | SortOptions[],
): Record<string, 1 | -1> {
  if (
    !sortOptions ||
    (Array.isArray(sortOptions) && sortOptions.length === 0)
  ) {
    return { createdAt: -1 }
  }

  if (Array.isArray(sortOptions)) {
    return sortOptions.reduce(
      (acc, option) => {
        acc[option.field] = option.direction
        return acc
      },
      {} as Record<string, 1 | -1>,
    )
  }

  return { [sortOptions.field]: sortOptions.direction }
}

/**
 * Build default pagination options
 */
export function getDefaultPaginationOptions(
  options?: Partial<PaginationOptions>,
): PaginationOptions {
  return {
    skip: 0,
    limit: 10,
    sort: { createdAt: -1 },
    ...options,
  }
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(
  skip?: number,
  limit?: number,
): { skip: number; limit: number } {
  const validSkip = Math.max(0, skip ?? 0)
  let validLimit = limit ?? 10 // Default after explicit values
  validLimit = Math.max(1, validLimit) // Min 1
  validLimit = Math.min(100, validLimit) // Max 100

  return { skip: validSkip, limit: validLimit }
}

/**
 * Sanitize a filter object by removing undefined values
 */
export function sanitizeFilter<T extends Record<string, unknown>>(
  filter: T,
): Partial<T> {
  const sanitized: Partial<T> = {}

  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value as T[keyof T] // Safe assertion after narrowing
    }
  }

  return sanitized
}
