import { Document } from 'mongoose'

/**
 * Base document interface that all domain entities should extend
 */
export interface BaseDocument extends Document<string> {
  _id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Pagination options for repository queries
 */
export interface PaginationOptions {
  skip?: number
  limit?: number
  sort?: Record<string, 1 | -1>
  populate?: string | string[]
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  documents: T[]
  total: number
  page?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

/**
 * Sort direction type
 */
export type SortDirection = 1 | -1

/**
 * Sort options for queries
 */
export interface SortOptions {
  field: string
  direction: SortDirection
}

/**
 * Common query options
 */
export interface QueryOptions extends PaginationOptions {
  select?: string | string[]
  lean?: boolean
}

/**
 * Update result type
 */
export interface UpdateResult {
  acknowledged: boolean
  modifiedCount: number
  upsertedId?: string
  upsertedCount?: number
  matchedCount?: number
}

/**
 * Delete result type
 */
export interface DeleteResult {
  acknowledged: boolean
  deletedCount: number
}
