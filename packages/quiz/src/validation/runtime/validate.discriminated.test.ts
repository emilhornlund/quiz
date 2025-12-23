import { describe, expect, it } from 'vitest'

import type { DiscriminatedRules, DtoRules, ValidationRules } from '../model'

import { validateDiscriminatedDto } from './validate'

type VariantA = {
  type: 'A'
  a: string
}

type VariantB = {
  type: 'B'
  b: string
}

type Union = VariantA | VariantB

const variantARules: DtoRules<VariantA, readonly []> = {
  optionalKeys: [] as const,
  rules: {
    type: { kind: 'string', oneOf: ['A'] as const },
    a: { kind: 'string' },
  },
}

const variantBRules: DtoRules<VariantB, readonly []> = {
  optionalKeys: [] as const,
  rules: {
    type: { kind: 'string', oneOf: ['B'] as const },
    b: { kind: 'string' },
  },
}

const discriminated: DiscriminatedRules<Union, 'type'> = {
  discriminator: 'type',
  variants: {
    A: variantARules as unknown as {
      rules: ValidationRules<object>
      optionalKeys: readonly string[]
    },
    B: variantBRules as unknown as {
      rules: ValidationRules<object>
      optionalKeys: readonly string[]
    },
  } as unknown as DiscriminatedRules<Union, 'type'>['variants'],
}

describe('validateDiscriminatedDto', () => {
  it("should return type error at '$' when input is not an object", () => {
    const res = validateDiscriminatedDto<Union, 'type'>('nope', discriminated)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: '$', code: 'type', message: 'Expected an object.' },
    ])
    expect(res.paths).toEqual({ $: false })
    expect(res.fields).toEqual({ $: false })
  })

  it('should return required error at discriminator path when discriminator key is missing', () => {
    const res = validateDiscriminatedDto<Union, 'type'>({}, discriminated)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: 'type', code: 'required', message: 'Required.' },
    ])
    expect(res.paths).toEqual({ type: false })
    expect(res.fields).toEqual({ type: false })
  })

  it('should return type error at discriminator path when discriminator value has wrong type (boolean)', () => {
    const res = validateDiscriminatedDto<Union, 'type'>(
      { type: true } as unknown,
      discriminated,
    )

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: 'type', code: 'type', message: 'Invalid discriminator type.' },
    ])
    expect(res.paths).toEqual({ type: false })
    expect(res.fields).toEqual({ type: false })
  })

  it('should return type error at discriminator path when discriminator value has wrong type (object)', () => {
    const res = validateDiscriminatedDto<Union, 'type'>(
      { type: { v: 'A' } } as unknown,
      discriminated,
    )

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: 'type', code: 'type', message: 'Invalid discriminator type.' },
    ])
    expect(res.paths).toEqual({ type: false })
    expect(res.fields).toEqual({ type: false })
  })

  it('should return oneOf error at discriminator path when discriminator value is unknown', () => {
    const res = validateDiscriminatedDto<Union, 'type'>(
      { type: 'C' } as unknown,
      discriminated,
    )

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: 'type', code: 'oneOf', message: 'Unknown discriminator value.' },
    ])
    expect(res.paths).toEqual({ type: false })
    expect(res.fields).toEqual({ type: false })
  })

  it('should select variant A and require field a', () => {
    const res = validateDiscriminatedDto<Union, 'type'>(
      { type: 'A' },
      discriminated,
    )

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: 'a', code: 'required', message: 'Required.' },
    ])
    expect(res.paths).toEqual({ a: false })
    expect(res.fields).toEqual({ a: false })
  })

  it('should select variant B and require field b', () => {
    const res = validateDiscriminatedDto<Union, 'type'>(
      { type: 'B' },
      discriminated,
    )

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual([
      { path: 'b', code: 'required', message: 'Required.' },
    ])
    expect(res.paths).toEqual({ b: false })
    expect(res.fields).toEqual({ b: false })
  })

  it('should be valid when the selected variant has all required fields', () => {
    const resA = validateDiscriminatedDto<Union, 'type'>(
      { type: 'A', a: 'ok' },
      discriminated,
    )
    expect(resA).toEqual({
      valid: true,
      errors: [],
      fields: {},
      paths: {},
    })

    const resB = validateDiscriminatedDto<Union, 'type'>(
      { type: 'B', b: 'ok' },
      discriminated,
    )
    expect(resB).toEqual({
      valid: true,
      errors: [],
      fields: {},
      paths: {},
    })
  })
})
