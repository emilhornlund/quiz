import 'reflect-metadata'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { PaginatedQuizRatingFilter } from './paginated-quiz-rating.filter'

type ValidationResult = {
  instance: PaginatedQuizRatingFilter
  errors: string[]
}

const validateFilter = async (
  input: Record<string, unknown>,
): Promise<ValidationResult> => {
  const instance = plainToInstance(PaginatedQuizRatingFilter, input)
  const validationErrors = await validate(instance)

  const errors = validationErrors.flatMap((e) =>
    e.constraints ? Object.values(e.constraints) : [],
  )

  return { instance, errors }
}

describe(PaginatedQuizRatingFilter.name, () => {
  describe('happy paths', () => {
    it('accepts an empty object (all fields optional)', async () => {
      const { instance, errors } = await validateFilter({})

      expect(errors).toEqual([])
      expect(instance.sort).toBeUndefined()
      expect(instance.order).toBeUndefined()
      expect(instance.limit).toBeUndefined()
      expect(instance.offset).toBeUndefined()
      expect(instance.commentsOnly).toBeUndefined()
    })

    it('accepts valid values for sort and order', async () => {
      const { errors } = await validateFilter({
        sort: 'created',
        order: 'desc',
      })

      expect(errors).toEqual([])
    })

    it('accepts limit within [5, 50] and offset >= 0', async () => {
      const { errors } = await validateFilter({
        limit: 5,
        offset: 0,
      })

      expect(errors).toEqual([])
    })

    it('accepts commentsOnly as a boolean', async () => {
      const { errors } = await validateFilter({
        commentsOnly: true,
      })

      expect(errors).toEqual([])
    })
  })

  describe('class-transformer conversions', () => {
    it('transforms limit and offset from numeric strings into numbers', async () => {
      const { instance, errors } = await validateFilter({
        limit: '10',
        offset: '3',
      })

      expect(errors).toEqual([])
      expect(instance.limit).toBe(10)
      expect(instance.offset).toBe(3)
      expect(typeof instance.limit).toBe('number')
      expect(typeof instance.offset).toBe('number')
    })

    it('transforms commentsOnly from common query inputs', async () => {
      const a = await validateFilter({ commentsOnly: 'true' })
      expect(a.errors).toEqual([])
      expect(a.instance.commentsOnly).toBe(true)

      const b = await validateFilter({ commentsOnly: 'false' })
      expect(b.errors).toEqual([])
      expect(b.instance.commentsOnly).toBe(false)

      const c = await validateFilter({ commentsOnly: 0 })
      expect(c.errors).toEqual([])
      expect(c.instance.commentsOnly).toBe(false)

      const d = await validateFilter({ commentsOnly: 1 })
      expect(d.errors).toEqual([])
      expect(d.instance.commentsOnly).toBe(true)

      const e = await validateFilter({ commentsOnly: true })
      expect(e.errors).toEqual([])
      expect(e.instance.commentsOnly).toBe(true)

      const f = await validateFilter({ commentsOnly: false })
      expect(f.errors).toEqual([])
      expect(f.instance.commentsOnly).toBe(false)
    })
  })

  describe('validation failures: sort', () => {
    it('rejects invalid sort values with the custom message', async () => {
      const { errors } = await validateFilter({ sort: 'title' })

      expect(errors).toContain(
        'sort must be one of the following values: created, updated',
      )
    })

    it('rejects non-string sort values (still fails enum check)', async () => {
      const { errors } = await validateFilter({ sort: 123 })

      expect(errors).toContain(
        'sort must be one of the following values: created, updated',
      )
    })
  })

  describe('validation failures: order', () => {
    it('rejects invalid order values with the custom message', async () => {
      const { errors } = await validateFilter({ order: 'up' })

      expect(errors).toContain(
        'order must be one of the following values: asc, desc',
      )
    })

    it('rejects non-string order values (still fails enum check)', async () => {
      const { errors } = await validateFilter({ order: false })

      expect(errors).toContain(
        'order must be one of the following values: asc, desc',
      )
    })
  })

  describe('validation failures: limit', () => {
    it('rejects limit < 5', async () => {
      const { errors } = await validateFilter({ limit: 4 })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('limit must not be less than 5'),
        ]),
      )
    })

    it('rejects limit > 50', async () => {
      const { errors } = await validateFilter({ limit: 51 })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('limit must not be greater than 50'),
        ]),
      )
    })

    it('rejects non-integer limit', async () => {
      const { errors } = await validateFilter({ limit: 10.5 })

      expect(errors).toContain('limit must be an integer number')
    })

    it('rejects non-numeric limit even after transformation', async () => {
      const { instance, errors } = await validateFilter({ limit: 'abc' })

      // @Type(() => Number) => Number('abc') => NaN
      expect(Number.isNaN(instance.limit as unknown as number)).toBe(true)
      expect(errors).toContain('limit must be an integer number')
    })

    it('rejects numeric string if not an integer', async () => {
      const { instance, errors } = await validateFilter({ limit: '10.2' })

      expect(instance.limit).toBe(10.2)
      expect(errors).toContain('limit must be an integer number')
    })
  })

  describe('validation failures: offset', () => {
    it('rejects offset < 0', async () => {
      const { errors } = await validateFilter({ offset: -1 })

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('offset must not be less than 0'),
        ]),
      )
    })

    it('rejects non-integer offset', async () => {
      const { errors } = await validateFilter({ offset: 1.1 })

      expect(errors).toContain('offset must be an integer number')
    })

    it('rejects non-numeric offset even after transformation', async () => {
      const { instance, errors } = await validateFilter({ offset: 'nope' })

      expect(Number.isNaN(instance.offset as unknown as number)).toBe(true)
      expect(errors).toContain('offset must be an integer number')
    })
  })

  describe('validation failures: commentsOnly', () => {
    it('rejects invalid boolean values', async () => {
      const { errors } = await validateFilter({ commentsOnly: 'XXX' })
      expect(errors).toEqual(
        expect.arrayContaining([expect.stringContaining('must be a boolean')]),
      )
    })
  })

  describe('multiple errors', () => {
    it('returns all relevant validation errors for multiple invalid fields', async () => {
      const { errors } = await validateFilter({
        sort: 'bad',
        order: 'bad',
        limit: 2,
        offset: -5,
      })

      expect(errors).toEqual(
        expect.arrayContaining([
          'sort must be one of the following values: created, updated',
          'order must be one of the following values: asc, desc',
          expect.stringContaining('limit must not be less than 5'),
          expect.stringContaining('offset must not be less than 0'),
        ]),
      )
    })
  })
})
