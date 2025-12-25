import { describe, expect, it } from 'vitest'

import { normalizeString } from './string.utils'

describe('normalizeString', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeString('  Hello World  ')).toBe('hello world')
  })

  it('converts the string to lowercase', () => {
    expect(normalizeString('HeLLo')).toBe('hello')
  })

  it('handles empty strings', () => {
    expect(normalizeString('')).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(normalizeString(undefined)).toBe('')
  })

  it('returns empty string for null input', () => {
    expect(normalizeString(null)).toBe('')
  })

  it('handles strings with only whitespace', () => {
    expect(normalizeString('   ')).toBe('')
  })

  it('does not modify internal whitespace', () => {
    expect(normalizeString('  Hello   World  ')).toBe('hello   world')
  })
})
