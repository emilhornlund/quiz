import { describe, expect, it } from 'vitest'

import { generateRandomString, sha256 } from './oauth'

describe('generateRandomString()', () => {
  it('produces a hex string of default length (48 bytes → 96 hex chars)', () => {
    const str = generateRandomString()
    expect(typeof str).toBe('string')
    expect(str).toHaveLength(48 * 2)
    expect(str).toMatch(/^[0-9a-f]+$/)
  })

  it('respects a custom length parameter', () => {
    const len = 10
    const str = generateRandomString(len)
    expect(str).toHaveLength(len * 2)
    expect(str).toMatch(/^[0-9a-f]+$/)
  })

  it('returns an empty string when length is zero', () => {
    expect(generateRandomString(0)).toBe('')
  })

  it('generates unique values on subsequent calls', () => {
    const a = generateRandomString()
    const b = generateRandomString()
    expect(a).not.toBe(b)
  })
})

describe('sha256()', () => {
  it('correctly hashes "abc" to the known Base64-URL result', async () => {
    const result = await sha256('abc')
    expect(result).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0')
  })

  it('treats undefined the same as empty string', async () => {
    const empty = await sha256('')
    const undef = await sha256()
    expect(undef).toBe(empty)
    expect(empty).toBe('47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU')
  })

  it('outputs only URL-safe Base64 characters and a valid length', async () => {
    const result = await sha256('test')
    // Only A-Z, a-z, 0-9, - and _
    expect(result).toMatch(/^[A-Za-z0-9_-]+$/)
    // SHA-256 digest is 32 bytes → Base64 length 44 with padding,
    // stripped padding gives 43 or 44 characters
    expect([43, 44]).toContain(result.length)
  })
})
