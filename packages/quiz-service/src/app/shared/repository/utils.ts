import { v4 as uuidv4 } from 'uuid'

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
  if (!sortOptions) {
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
  const validSkip = Math.max(0, skip || 0)
  const validLimit = Math.min(100, Math.max(1, limit || 10)) // Max 100 items per page

  return { skip: validSkip, limit: validLimit }
}

/**
 * Generate a unique identifier using UUID v4
 */
export function generateId(): string {
  return uuidv4()
}

/**
 * Check if a value is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Sanitize filter object by removing undefined values
 */
export function sanitizeFilter<T extends Record<string, never>>(
  filter: T,
): Partial<T> {
  const sanitized: Partial<T> = {}

  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value
    }
  }

  return sanitized
}
