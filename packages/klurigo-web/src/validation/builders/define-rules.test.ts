import { describe, expect, it } from 'vitest'

import type { DtoRules, ValidationRules } from '../model'

import { defineRules } from './define-rules'

type Dto = {
  title: string
  info?: string
}

describe('defineRules', () => {
  it('should return { rules, optionalKeys } with optionalKeys defaulting to []', () => {
    const rules: ValidationRules<Dto> = {
      title: { kind: 'string' },
      info: { kind: 'string' },
    }

    const res = defineRules<Dto>()()(rules)

    expect(res).toEqual<DtoRules<Dto, readonly []>>({
      rules,
      optionalKeys: [],
    })
  })

  it('should return { rules, optionalKeys } when optionalKeys are provided', () => {
    const rules: ValidationRules<Dto> = {
      title: { kind: 'string' },
      info: { kind: 'string' },
    }

    const res = defineRules<Dto>()({
      optionalKeys: ['info'] as const,
    })(rules)

    expect(res).toEqual({
      rules,
      optionalKeys: ['info'],
    })
  })

  it('should preserve the rules object reference (no cloning)', () => {
    const rules: ValidationRules<Dto> = {
      title: { kind: 'string' },
      info: { kind: 'string' },
    }

    const res = defineRules<Dto>()({ optionalKeys: ['info'] as const })(rules)

    expect(res.rules).toBe(rules)
  })

  it('should preserve the optionalKeys array reference when provided', () => {
    const rules: ValidationRules<Dto> = {
      title: { kind: 'string' },
      info: { kind: 'string' },
    }

    const optionalKeys = ['info'] as const
    const res = defineRules<Dto>()({ optionalKeys })(rules)

    expect(res.optionalKeys).toBe(optionalKeys)
  })
})
