import { describe, expect, it } from 'vitest'

import type { DtoRules, ValidationErrorCode, ValidationRules } from '../model'

import { validateDto } from './validate'

type TrivialDto = {
  title: string
  info?: string
  media?: {
    url: string
  }
}

const buildTrivialRules = (overrides?: {
  infoRequired?: boolean
  mediaRequired?: boolean
}): DtoRules<TrivialDto, readonly ('info' | 'media')[]> => {
  const rules: ValidationRules<TrivialDto> = {
    title: {
      kind: 'string',
    },
    info: {
      kind: 'string',
      ...(overrides?.infoRequired === undefined
        ? {}
        : { required: overrides.infoRequired }),
    },
    media: {
      kind: 'object',
      ...(overrides?.mediaRequired === undefined
        ? {}
        : { required: overrides.mediaRequired }),
      shape: {
        url: { kind: 'string' },
      },
    },
  }

  return {
    rules,
    optionalKeys: ['info', 'media'] as const,
  }
}

const expectSingleError = (
  res: ReturnType<typeof validateDto<TrivialDto>>,
  opts: { path: string; code: ValidationErrorCode },
) => {
  expect(res.valid).toBe(false)
  expect(res.errors).toHaveLength(1)
  expect(res.errors[0]).toEqual(
    expect.objectContaining({
      path: opts.path,
      code: opts.code,
    }),
  )
}

describe('validateDto requiredness', () => {
  it('should produce a required error when a required key is missing', () => {
    const dtoRules = buildTrivialRules()

    const res = validateDto<TrivialDto>({}, dtoRules)

    expectSingleError(res, { path: 'title', code: 'required' })
    expect(res.paths).toEqual({ title: false })
    expect(res.fields).toEqual({ title: false })
  })

  it('should not error when an optional key is missing (via optionalKeys)', () => {
    const dtoRules = buildTrivialRules()

    const res = validateDto<TrivialDto>({ title: 'Hello' }, dtoRules)

    expect(res).toEqual({
      valid: true,
      errors: [],
      fields: {},
      paths: {},
    })
  })

  it('should allow explicit required: false to override optionalKeys and make a key optional', () => {
    const dtoRules = buildTrivialRules({ infoRequired: false })

    const res = validateDto<TrivialDto>({ title: 'Hello' }, dtoRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toEqual([])
    expect(res.fields).toEqual({})
    expect(res.paths).toEqual({})
  })

  it('should allow explicit required: true to override optionalKeys and force required', () => {
    const dtoRules = buildTrivialRules({ infoRequired: true })

    const res = validateDto<TrivialDto>({ title: 'Hello' }, dtoRules)

    expectSingleError(res, { path: 'info', code: 'required' })
    expect(res.paths).toEqual({ info: false })
    expect(res.fields).toEqual({ info: false })
  })

  it('should apply requiredness independently for nested objects (media) based on optionalKeys', () => {
    const dtoRules = buildTrivialRules()

    const res = validateDto<TrivialDto>({ title: 'Hello' }, dtoRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toEqual([])
  })

  it('should validate nested required keys when an optional object is provided (media.url required within shape)', () => {
    const dtoRules = buildTrivialRules()

    const res = validateDto<TrivialDto>({ title: 'Hello', media: {} }, dtoRules)

    expectSingleError(res, { path: 'media.url', code: 'required' })
    expect(res.paths).toEqual({ 'media.url': false })
    expect(res.fields).toEqual({ media: false })
  })
})
