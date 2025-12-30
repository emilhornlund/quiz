import { describe, expect, it } from 'vitest'

import type {
  DtoRules,
  ValidationError,
  ValidationErrorCode,
  ValidationRules,
} from '../model'

import { validateDto } from './validate'

type Dto = {
  media: {
    url: string
    caption?: string
  }
}

const buildRules = (overrides?: {
  mediaRule?: ValidationRules<Dto>['media']
}): DtoRules<Dto, readonly []> => {
  const rules: ValidationRules<Dto> = {
    media: {
      kind: 'object',
      shape: {
        url: { kind: 'string' },
        caption: { kind: 'string' },
      },
      ...(overrides?.mediaRule ?? {}),
    },
  }

  return { rules, optionalKeys: [] as const }
}

const expectSingleError = (
  res: ReturnType<typeof validateDto<Dto>>,
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

describe('validateDto objects', () => {
  it("should return type error when rule is kind: 'object' but value is not an object", () => {
    const res = validateDto<Dto>({ media: 'nope' }, buildRules())

    expectSingleError(res, { path: 'media', code: 'type' })
    expect(res.fields).toEqual({ media: false })
  })

  it('should include nested shape errors with correct dot path (media.url)', () => {
    const rules = buildRules({
      mediaRule: {
        kind: 'object',
        optionalKeys: ['caption'] as const,
        shape: {
          url: { kind: 'string' },
          caption: { kind: 'string' },
        },
      },
    })

    const res = validateDto<Dto>({ media: {} }, rules)

    expectSingleError(res, { path: 'media.url', code: 'required' })
    expect(res.fields).toEqual({ media: false })
  })

  it('should run object-level custom and use keyPath as args.path', () => {
    const rules = buildRules({
      mediaRule: {
        kind: 'object',
        optionalKeys: ['caption'] as const,
        shape: {
          url: { kind: 'string' },
          caption: { kind: 'string' },
        },
        custom: ({ path }) => (path === 'media' ? 'Custom media error.' : null),
      },
    })

    const res = validateDto<Dto>({ media: { url: 'x' } }, rules)

    expectSingleError(res, { path: 'media', code: 'custom' })
    expect(res.errors[0].message).toBe('Custom media error.')
    expect(res.fields).toEqual({ media: false })
  })

  it('should apply ObjectRule.optionalKeys inside nested object shape', () => {
    const rules = buildRules({
      mediaRule: {
        kind: 'object',
        optionalKeys: ['caption'] as const,
        shape: {
          url: { kind: 'string' },
          caption: { kind: 'string' },
        },
      },
    })

    const res = validateDto<Dto>({ media: { url: 'x' } }, rules)

    expect(res.valid).toBe(true)
    expect(res.errors).toEqual([])
    expect(res.fields).toEqual({})
    expect(res.paths).toEqual({})
  })

  it('should require nested keys by default when not listed in ObjectRule.optionalKeys', () => {
    const res = validateDto<Dto>({ media: {} }, buildRules())

    expect(res.valid).toBe(false)
    expectHasError(res.errors, { path: 'media.url', code: 'required' })
    expectHasError(res.errors, { path: 'media.caption', code: 'required' })
    expect(res.fields).toEqual({ media: false })
    expect(res.paths['media.url']).toBe(false)
    expect(res.paths['media.caption']).toBe(false)
  })
})
