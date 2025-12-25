export type { IBaseRepository } from './base-repository.interface'
export { BaseRepository } from './base.repository'

// Types
export type {
  BaseDocument,
  PaginationOptions,
  PaginatedResult,
  SortDirection,
  SortOptions,
  QueryOptions,
  UpdateResult,
  DeleteResult,
} from './types'

// Utils
export {
  buildPaginationMetadata,
  buildSortObject,
  getDefaultPaginationOptions,
  validatePaginationParams,
  sanitizeFilter,
} from './utils'
