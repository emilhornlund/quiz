import { describe, expect, it } from 'vitest'

import {
  classNames,
  extractUrl,
  isValidNumber,
  trimToUndefined,
} from './helpers'

describe('classNames', () => {
  it('joins non-empty class names with spaces', () => {
    expect(classNames('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('trims individual class names', () => {
    expect(classNames('  foo  ', '  bar')).toBe('foo bar')
  })

  it('omits empty strings, null, and undefined', () => {
    expect(classNames('', null, undefined, 'foo', ' ', 'bar')).toBe('foo bar')
  })

  it('returns empty string when everything is falsy/empty', () => {
    expect(classNames('', ' ', undefined, null)).toBe('')
  })

  it('preserves internal spaces inside a single token (only trims ends)', () => {
    expect(classNames(' foo  bar ', 'baz')).toBe('foo  bar baz')
  })
})

describe('extractUrl', () => {
  it('returns undefined for missing or invalid input', () => {
    expect(extractUrl(undefined)).toBeUndefined()
    expect(extractUrl('not a url')).toBeUndefined()
    expect(extractUrl('example.com/path')).toBeUndefined() // missing protocol
  })

  it('extracts protocol + host by default', () => {
    expect(extractUrl('https://example.com/some/path?q=1#hash')).toBe(
      'https://example.com',
    )
  })

  it('includes port in host when present', () => {
    expect(extractUrl('http://localhost:3000/abc')).toBe(
      'http://localhost:3000',
    )
  })

  it('omits protocol when option is set', () => {
    expect(
      extractUrl('https://example.com/some/path', { omitProtocol: true }),
    ).toBe('example.com')
    expect(extractUrl('http://localhost:8080/x', { omitProtocol: true })).toBe(
      'localhost:8080',
    )
  })
})

describe('isValidNumber', () => {
  it('rejects undefined and NaN', () => {
    expect(isValidNumber(undefined)).toBe(false)
    expect(isValidNumber(Number.NaN)).toBe(false)
  })

  it('accepts a finite number when no bounds are given', () => {
    expect(isValidNumber(0)).toBe(true)
    expect(isValidNumber(42)).toBe(true)
    expect(isValidNumber(-5)).toBe(true)
  })

  it('applies min (inclusive)', () => {
    expect(isValidNumber(4, 5)).toBe(false)
    expect(isValidNumber(5, 5)).toBe(true)
    expect(isValidNumber(6, 5)).toBe(true)
  })

  it('applies max (inclusive)', () => {
    expect(isValidNumber(11, undefined, 10)).toBe(false)
    expect(isValidNumber(10, undefined, 10)).toBe(true)
    expect(isValidNumber(9, undefined, 10)).toBe(true)
  })

  it('applies both min and max (inclusive range)', () => {
    expect(isValidNumber(4, 5, 10)).toBe(false)
    expect(isValidNumber(5, 5, 10)).toBe(true)
    expect(isValidNumber(7, 5, 10)).toBe(true)
    expect(isValidNumber(10, 5, 10)).toBe(true)
    expect(isValidNumber(11, 5, 10)).toBe(false)
  })
})

describe('trimToUndefined', () => {
  it('returns undefined for undefined input', () => {
    expect(trimToUndefined(undefined)).toBeUndefined()
  })

  it('returns undefined for whitespace-only strings', () => {
    expect(trimToUndefined('')).toBeUndefined()
    expect(trimToUndefined('   ')).toBeUndefined()
    expect(trimToUndefined('\n\t')).toBeUndefined()
  })

  it('trims and returns non-empty strings', () => {
    expect(trimToUndefined('  hello  ')).toBe('hello')
    expect(trimToUndefined('\tfoo\n')).toBe('foo')
  })
})
