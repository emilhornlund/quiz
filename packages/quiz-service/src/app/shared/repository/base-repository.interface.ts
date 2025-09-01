import { FilterQuery, UpdateQuery } from 'mongoose'

/**
 * Base interface for repository operations
 */
export interface IBaseRepository<T> {
  /**
   * Find a document by its ID
   */
  findById(id: string): Promise<T | null>

  /**
   * Find a single document matching the filter
   */
  findOne(filter: FilterQuery<T>): Promise<T | null>

  /**
   * Find multiple documents matching the filter
   */
  find(filter: FilterQuery<T>): Promise<T[]>

  /**
   * Find documents with pagination
   */
  findWithPagination(
    filter: FilterQuery<T>,
    options: {
      skip?: number
      limit?: number
      sort?: Record<string, 1 | -1>
      populate?: string | string[]
    },
  ): Promise<{ documents: T[]; total: number }>

  /**
   * Create a new document
   */
  create(data: Partial<T>): Promise<T>

  /**
   * Update a document by ID
   */
  update(id: string, data: UpdateQuery<T>): Promise<T | null>

  /**
   * Update multiple documents matching the filter
   */
  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number>

  /**
   * Delete a document by ID
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete multiple documents matching the filter
   */
  deleteMany(filter: FilterQuery<T>): Promise<number>

  /**
   * Count documents matching the filter
   */
  count(filter: FilterQuery<T>): Promise<number>

  /**
   * Check if a document exists matching the filter
   */
  exists(filter: FilterQuery<T>): Promise<boolean>
}
