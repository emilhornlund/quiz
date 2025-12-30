import { describe, expect, it } from 'vitest'

import type {
  DtoRules,
  ValidationError,
  ValidationErrorCode,
  ValidationRules,
} from '../model'

import { validateDto } from './validate'

type PrimitiveDto = {
  title: string
  points: number
  published: boolean
  mode: string
  rating: number
}

const buildRules = (
  overrides?: Partial<{
    title: ValidationRules<PrimitiveDto>['title']
    points: ValidationRules<PrimitiveDto>['points']
    published: ValidationRules<PrimitiveDto>['published']
    mode: ValidationRules<PrimitiveDto>['mode']
    rating: ValidationRules<PrimitiveDto>['rating']
  }>,
): DtoRules<PrimitiveDto, readonly []> => {
  const rules: ValidationRules<PrimitiveDto> = {
    title: {
      kind: 'string',
      minLength: 2,
      maxLength: 5,
      regex: /^[A-Z]+$/,
      ...(overrides?.title ?? {}),
    },
    points: {
      kind: 'number',
      min: 0,
      max: 10,
      integer: true,
      ...(overrides?.points ?? {}),
    },
    published: {
      kind: 'boolean',
      ...(overrides?.published ?? {}),
    },
    mode: {
      kind: 'string',
      oneOf: ['A', 'B'] as const,
      ...(overrides?.mode ?? {}),
    },
    rating: {
      kind: 'number',
      oneOf: [1, 2, 3] as const,
      ...(overrides?.rating ?? {}),
    },
  }

  return { rules, optionalKeys: [] as const }
}

const baseValidDto: PrimitiveDto = {
  title: 'AB',
  points: 5,
  published: true,
  mode: 'A',
  rating: 2,
}

const expectSingleError = (
  res: ReturnType<typeof validateDto<PrimitiveDto>>,
  expected: { path: string; code: ValidationErrorCode },
) => {
  expect(res.valid).toBe(false)
  expect(res.errors).toHaveLength(1)
  expect(res.errors[0]).toEqual(
    expect.objectContaining({
      path: expected.path,
      code: expected.code,
    }),
  )
  expect(res.paths).toEqual({ [expected.path]: false })
}

const expectHasError = (
  errors: ValidationError[],
  expected: { path: string; code: ValidationErrorCode },
) => {
  expect(
    errors.some((e) => e.path === expected.path && e.code === expected.code),
  ).toBe(true)
}

describe('validateDto primitives', () => {
  describe('string', () => {
    it('should return type error for string type mismatch', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, title: 123 as unknown as string },
        buildRules(),
      )

      expectSingleError(res, { path: 'title', code: 'type' })
      expect(res.fields).toEqual({ title: false })
    })

    it('should validate minLength', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, title: 'A' },
        buildRules(),
      )

      expectSingleError(res, { path: 'title', code: 'minLength' })
    })

    it('should validate maxLength', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, title: 'ABCDEZ' },
        buildRules(),
      )

      expectSingleError(res, { path: 'title', code: 'maxLength' })
    })

    it('should validate regex', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, title: 'Ab' },
        buildRules(),
      )

      expectSingleError(res, { path: 'title', code: 'regex' })
    })

    it('should validate oneOf for string primitives', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, mode: 'C' },
        buildRules(),
      )

      expectSingleError(res, { path: 'mode', code: 'oneOf' })
      expect(res.fields).toEqual({ mode: false })
    })
  })

  describe('number', () => {
    it('should return type error for number type mismatch', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, points: '5' as unknown as number },
        buildRules(),
      )

      expectSingleError(res, { path: 'points', code: 'type' })
      expect(res.fields).toEqual({ points: false })
    })

    it('should reject NaN as type error', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, points: Number.NaN },
        buildRules(),
      )

      expectSingleError(res, { path: 'points', code: 'type' })
    })

    it('should validate min', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, points: -1 },
        buildRules(),
      )

      expectSingleError(res, { path: 'points', code: 'min' })
    })

    it('should validate max', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, points: 11 },
        buildRules(),
      )

      expectSingleError(res, { path: 'points', code: 'max' })
    })

    it('should validate integer', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, points: 1.5 },
        buildRules(),
      )

      expectSingleError(res, { path: 'points', code: 'integer' })
    })

    it('should validate oneOf for number primitives', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, rating: 4 },
        buildRules(),
      )

      expectSingleError(res, { path: 'rating', code: 'oneOf' })
      expect(res.fields).toEqual({ rating: false })
    })
  })

  describe('boolean', () => {
    it('should return type error for boolean type mismatch', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, published: 'true' as unknown as boolean },
        buildRules(),
      )

      expectSingleError(res, { path: 'published', code: 'type' })
      expect(res.fields).toEqual({ published: false })
    })

    it('should validate oneOf for boolean primitives', () => {
      const rules = buildRules({
        published: { kind: 'boolean', oneOf: [true] as const },
      })

      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, published: false },
        rules,
      )

      expectSingleError(res, { path: 'published', code: 'oneOf' })
    })
  })

  describe('custom (primitives)', () => {
    it('should produce custom error at correct path when custom returns a string', () => {
      const rules = buildRules({
        title: {
          kind: 'string',
          custom: ({ path }) =>
            path === 'title' ? 'Custom failure.' : 'Unexpected.',
        },
      })

      const res = validateDto<PrimitiveDto>({ ...baseValidDto }, rules)

      expectSingleError(res, { path: 'title', code: 'custom' })
      expect(res.errors[0].message).toBe('Custom failure.')
    })

    it('should not produce an error when custom returns null', () => {
      const rules = buildRules({
        title: {
          kind: 'string',
          custom: () => null,
        },
      })

      const res = validateDto<PrimitiveDto>({ ...baseValidDto }, rules)

      expect(res.valid).toBe(true)
      expect(res.errors).toEqual([])
      expect(res.fields).toEqual({})
      expect(res.paths).toEqual({})
    })

    it('should accumulate multiple errors for a single primitive when multiple constraints fail', () => {
      const res = validateDto<PrimitiveDto>(
        { ...baseValidDto, title: 'a' },
        buildRules({
          title: { kind: 'string', minLength: 2, regex: /^[A-Z]+$/ },
        }),
      )

      expect(res.valid).toBe(false)
      expectHasError(res.errors, { path: 'title', code: 'minLength' })
      expectHasError(res.errors, { path: 'title', code: 'regex' })
      expect(res.fields).toEqual({ title: false })
      expect(res.paths['title']).toBe(false)
    })
  })
})
