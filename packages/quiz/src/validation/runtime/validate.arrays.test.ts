import { describe, expect, it } from 'vitest'

import type { DtoRules, ValidationError, ValidationErrorCode } from '../model'

import { validateDto } from './validate'

type PrimitiveArrayDto = {
  options: string[]
}

type ObjectArrayDto = {
  options: Array<{
    value: string
  }>
}

const expectSingleError = <T extends object>(
  res: ReturnType<typeof validateDto<T>>,
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

describe('validateDto arrays', () => {
  it("should return type error when rule is kind: 'array' but value is not an array", () => {
    const rules: DtoRules<PrimitiveArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          element: { kind: 'string' },
        },
      },
    }

    const res = validateDto<PrimitiveArrayDto>(
      { options: 'nope' } as unknown as PrimitiveArrayDto,
      rules,
    )

    expectSingleError(res, { path: 'options', code: 'type' })
    expect(res.fields).toEqual({ options: false })
  })

  it('should validate minItems', () => {
    const rules: DtoRules<PrimitiveArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          minItems: 2,
          element: { kind: 'string' },
        },
      },
    }

    const res = validateDto<PrimitiveArrayDto>({ options: [] }, rules)

    expectSingleError(res, { path: 'options', code: 'min' })
  })

  it('should validate maxItems', () => {
    const rules: DtoRules<PrimitiveArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          maxItems: 2,
          element: { kind: 'string' },
        },
      },
    }

    const res = validateDto<PrimitiveArrayDto>(
      { options: ['a', 'b', 'c'] },
      rules,
    )

    expectSingleError(res, { path: 'options', code: 'max' })
  })

  it('should validate primitive elements and use element path options[0]', () => {
    const rules: DtoRules<PrimitiveArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          element: { kind: 'string', minLength: 2 },
        },
      },
    }

    const res = validateDto<PrimitiveArrayDto>({ options: ['a'] }, rules)

    expectSingleError(res, { path: 'options[0]', code: 'minLength' })
    expect(res.fields).toEqual({ options: false })
  })

  it('should validate object elements and use nested path options[0].value', () => {
    const rules: DtoRules<ObjectArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          element: {
            kind: 'object',
            shape: {
              value: { kind: 'string', minLength: 2 },
            },
          },
        },
      },
    }

    const res = validateDto<ObjectArrayDto>(
      { options: [{ value: 'a' }] },
      rules,
    )

    expectSingleError(res, { path: 'options[0].value', code: 'minLength' })
    expect(res.fields).toEqual({ options: false })
  })

  it('should run array rule custom on the array property path (options)', () => {
    const rules: DtoRules<PrimitiveArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          element: { kind: 'string' },
          custom: ({ path }) => (path === 'options' ? 'Array custom.' : null),
        },
      },
    }

    const res = validateDto<PrimitiveArrayDto>({ options: ['a'] }, rules)

    expectSingleError(res, { path: 'options', code: 'custom' })
    expect(res.errors[0].message).toBe('Array custom.')
    expect(res.fields).toEqual({ options: false })
  })

  it('should run element object custom at options[0] and stop shape validation for that element', () => {
    const rules: DtoRules<ObjectArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          element: {
            kind: 'object',
            shape: {
              value: { kind: 'string', minLength: 2 },
            },
            custom: ({ path }) =>
              path === 'options[0]' ? 'Element 0 custom.' : null,
          },
        },
      },
    }

    const res = validateDto<ObjectArrayDto>(
      { options: [{ value: 'a' }, { value: 'ok' }] },
      rules,
    )

    expect(res.valid).toBe(false)
    expectHasError(res.errors, { path: 'options[0]', code: 'custom' })
    expect(res.errors.find((e) => e.path === 'options[0]')?.message).toBe(
      'Element 0 custom.',
    )

    // Because element custom fails, validate.ts should NOT descend into shape for that element.
    // That means we should NOT see 'options[0].value' minLength errors.
    expect(res.errors.some((e) => e.path === 'options[0].value')).toBe(false)

    expect(res.fields).toEqual({ options: false })
  })

  it('should contain { path: options[0], code: custom } when element custom fails only for index 0', () => {
    const rules: DtoRules<ObjectArrayDto, readonly []> = {
      optionalKeys: [] as const,
      rules: {
        options: {
          kind: 'array',
          element: {
            kind: 'object',
            shape: { value: { kind: 'string' } },
            custom: ({ path }) => (path === 'options[0]' ? 'Nope.' : null),
          },
        },
      },
    }

    const res = validateDto<ObjectArrayDto>(
      { options: [{ value: 'a' }, { value: 'b' }] },
      rules,
    )

    expect(res.valid).toBe(false)
    expectHasError(res.errors, { path: 'options[0]', code: 'custom' })
    expect(res.fields).toEqual({ options: false })
  })
})
