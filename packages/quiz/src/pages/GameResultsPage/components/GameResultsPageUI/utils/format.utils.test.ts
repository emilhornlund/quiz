import { describe, expect, it } from 'vitest'

import { formatRoundedDuration, formatRoundedSeconds } from './format.utils'

describe('formatRoundedDuration', () => {
  it('returns "0 minutes" for <30s', () => {
    expect(formatRoundedDuration(0)).toBe('0 minutes')
    expect(formatRoundedDuration(29)).toBe('0 minutes')
  })

  it('rounds to 1 minute at ≥30s', () => {
    expect(formatRoundedDuration(30)).toBe('1 minute')
    expect(formatRoundedDuration(89)).toBe('1 minute')
  })

  it('formats singular/plural hours and minutes', () => {
    expect(formatRoundedDuration(3600)).toBe('1 hour')
    expect(formatRoundedDuration(3660)).toBe('1 hour, 1 minute')
    expect(formatRoundedDuration(3720)).toBe('1 hour, 2 minutes')
  })

  it('formats multiple hours with minutes', () => {
    expect(formatRoundedDuration(7500)).toBe('2 hours, 5 minutes')
  })

  it('rounds up to next hour near boundary', () => {
    expect(formatRoundedDuration(7199)).toBe('2 hours')
  })
})

describe('formatRoundedSeconds', () => {
  it('formats whole seconds', () => {
    expect(formatRoundedSeconds(0)).toBe('0s')
    expect(formatRoundedSeconds(1000)).toBe('1s')
    expect(formatRoundedSeconds(1999)).toBe('2s')
  })

  it('formats to one decimal when needed', () => {
    expect(formatRoundedSeconds(1499)).toBe('1.5s')
    expect(formatRoundedSeconds(2345)).toBe('2.3s')
    expect(formatRoundedSeconds(10500)).toBe('10.5s')
  })
})
