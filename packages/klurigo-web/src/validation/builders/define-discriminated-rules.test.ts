import { describe, expect, it } from 'vitest'

import type { DiscriminatedRules, DtoRules, ValidationRules } from '../model'

import { defineDiscriminatedRules } from './define-discriminated-rules'

type VariantA = { type: 'A'; a: string }
type VariantB = { type: 'B'; b: string }
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

describe('defineDiscriminatedRules', () => {
  it('should return { discriminator, variants }', () => {
    const variants: DiscriminatedRules<Union, 'type'>['variants'] = {
      A: variantARules as unknown as {
        rules: ValidationRules<object>
        optionalKeys: readonly string[]
      },
      B: variantBRules as unknown as {
        rules: ValidationRules<object>
        optionalKeys: readonly string[]
      },
    } as unknown as DiscriminatedRules<Union, 'type'>['variants']

    const res = defineDiscriminatedRules<Union, 'type'>('type')(variants)

    expect(res).toEqual({
      discriminator: 'type',
      variants,
    })
  })

  it('should preserve the variants object reference (no cloning)', () => {
    const variants: DiscriminatedRules<Union, 'type'>['variants'] = {
      A: variantARules as unknown as {
        rules: ValidationRules<object>
        optionalKeys: readonly string[]
      },
      B: variantBRules as unknown as {
        rules: ValidationRules<object>
        optionalKeys: readonly string[]
      },
    } as unknown as DiscriminatedRules<Union, 'type'>['variants']

    const res = defineDiscriminatedRules<Union, 'type'>('type')(variants)

    expect(res.variants).toBe(variants)
  })

  it('should preserve the discriminator value', () => {
    const variants: DiscriminatedRules<Union, 'type'>['variants'] = {
      A: variantARules as unknown as {
        rules: ValidationRules<object>
        optionalKeys: readonly string[]
      },
      B: variantBRules as unknown as {
        rules: ValidationRules<object>
        optionalKeys: readonly string[]
      },
    } as unknown as DiscriminatedRules<Union, 'type'>['variants']

    const res = defineDiscriminatedRules<Union, 'type'>('type')(variants)

    expect(res.discriminator).toBe('type')
  })
})
