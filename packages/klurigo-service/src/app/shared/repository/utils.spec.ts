import { SortOptions } from './types'
import {
  buildPaginationMetadata,
  buildSortObject,
  getDefaultPaginationOptions,
  sanitizeFilter,
  validatePaginationParams,
} from './utils'

// Mock type for generic tests
interface User {
  id: string
  name: string
  email?: string
}

describe('Repository Utils', () => {
  describe('buildPaginationMetadata', () => {
    it('should build correct metadata for standard pagination', () => {
      const documents = [{ id: '1' }, { id: '2' }]
      const total = 25
      const options = { skip: 10, limit: 5 }

      const result = buildPaginationMetadata(documents, total, options)

      expect(result).toEqual({
        documents,
        total,
        page: 3, // (10 / 5) + 1
        totalPages: 5, // ceil(25 / 5)
        hasNext: true, // 3 * 5 = 15 < 25
        hasPrev: true, // page > 1
      })
    })

    it('should handle first page (skip=0)', () => {
      const documents = [{ id: '1' }]
      const total = 10
      const options = { skip: 0, limit: 10 }

      const result = buildPaginationMetadata(documents, total, options)

      expect(result.hasPrev).toBe(false)
      expect(result.hasNext).toBe(false) // Exact match
      expect(result.page).toBe(1)
    })

    it('should handle empty results', () => {
      const documents: User[] = []
      const total = 0
      const options = { skip: 0, limit: 10 }

      const result = buildPaginationMetadata(documents, total, options)

      expect(result.documents).toEqual([])
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
      expect(result.page).toBe(1)
    })

    it('should use defaults for missing options', () => {
      const documents = [{ id: '1' }]
      const total = 15

      const result = buildPaginationMetadata(documents, total, {})

      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(2) // ceil(15 / 10)
    })
  })

  describe('buildSortObject', () => {
    it('should return default sort if no options', () => {
      const result = buildSortObject()

      expect(result).toEqual({ createdAt: -1 })
    })

    it('should build sort from single option', () => {
      const result = buildSortObject({ field: 'name', direction: 1 })

      expect(result).toEqual({ name: 1 })
    })

    it('should build sort from multiple options', () => {
      const options: SortOptions[] = [
        { field: 'name', direction: 1 },
        { field: 'createdAt', direction: -1 },
      ]

      const result = buildSortObject(options)

      expect(result).toEqual({ name: 1, createdAt: -1 })
    })

    it('should handle empty array', () => {
      const result = buildSortObject([])

      expect(result).toEqual({ createdAt: -1 })
    })
  })

  describe('getDefaultPaginationOptions', () => {
    it('should return defaults when no options provided', () => {
      const result = getDefaultPaginationOptions()

      expect(result).toEqual({
        skip: 0,
        limit: 10,
        sort: { createdAt: -1 },
      })
    })

    it('should merge partial options with defaults', () => {
      const result = getDefaultPaginationOptions({ skip: 20, limit: 5 })

      expect(result).toEqual({
        skip: 20,
        limit: 5,
        sort: { createdAt: -1 },
      })
    })

    it('should override all defaults', () => {
      const result = getDefaultPaginationOptions({
        skip: 10,
        limit: 20,
        sort: { name: 1 },
      })

      expect(result.sort).toEqual({ name: 1 }) // Custom sort overrides
    })
  })

  describe('validatePaginationParams', () => {
    it('should validate standard params', () => {
      const result = validatePaginationParams(10, 5)

      expect(result).toEqual({ skip: 10, limit: 5 })
    })

    it('should clamp negative skip to 0', () => {
      const result = validatePaginationParams(-5, 10)

      expect(result.skip).toBe(0)
    })

    it('should clamp limit to 1-100 range', () => {
      expect(validatePaginationParams(0, 150).limit).toBe(100)
      expect(validatePaginationParams(0, 0).limit).toBe(1) // Now clamps to 1
      expect(validatePaginationParams(0, -5).limit).toBe(1)
    })

    it('should use defaults for undefined', () => {
      const result = validatePaginationParams(undefined, undefined)

      expect(result).toEqual({ skip: 0, limit: 10 })
    })
  })

  describe('sanitizeFilter', () => {
    it('should remove undefined and null values', () => {
      const input = {
        id: '123',
        name: 'John',
        email: undefined,
        age: null,
      } as Partial<User>

      const result = sanitizeFilter(input)

      expect(result).toEqual({ id: '123', name: 'John' })
    })

    it('should keep all valid values', () => {
      const input = {
        id: '123',
        name: 'John',
        email: 'test@example.com',
      } as Partial<User>

      const result = sanitizeFilter(input)

      expect(result).toEqual(input)
    })

    it('should handle empty object', () => {
      const result = sanitizeFilter({} as Partial<User>)

      expect(result).toEqual({})
    })

    it('should handle object with only undefined/null', () => {
      const input = { email: undefined, age: null } as Partial<User>

      const result = sanitizeFilter(input)

      expect(result).toEqual({})
    })
  })
})
