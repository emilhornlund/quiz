import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DATE_FORMATS, formatLocalDate, formatTimeAgo } from './date.utils'

const FIXED_NOW = new Date('2025-01-01T12:00:00.000Z')

const agoMs = (ms: number) => new Date(FIXED_NOW.getTime() - ms)
const sec = (n: number) => n * 1000
const min = (n: number) => sec(60 * n)
const hr = (n: number) => min(60 * n)
const day = (n: number) => hr(24 * n)

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('seconds bucket (< 60s)', () => {
    it('returns "Just now" for a few seconds ago', () => {
      expect(formatTimeAgo(agoMs(sec(5)))).toBe('Just now')
      expect(formatTimeAgo(agoMs(sec(59)))).toBe('Just now')
    })
  })

  describe('minutes bucket (< 60m)', () => {
    it('pluralizes correctly and handles boundary at 60 seconds', () => {
      expect(formatTimeAgo(agoMs(sec(60)))).toBe('1 minute ago')
      expect(formatTimeAgo(agoMs(min(2)))).toBe('2 minutes ago')
      expect(formatTimeAgo(agoMs(min(59)))).toBe('59 minutes ago')
    })
  })

  describe('hours bucket (< 24h)', () => {
    it('pluralizes correctly and handles boundary at 60 minutes', () => {
      expect(formatTimeAgo(agoMs(min(60)))).toBe('1 hour ago')
      expect(formatTimeAgo(agoMs(hr(2)))).toBe('2 hours ago')
      expect(formatTimeAgo(agoMs(hr(23)))).toBe('23 hours ago')
    })
  })

  describe('days bucket (< 30d)', () => {
    it('pluralizes correctly and handles boundary at 24 hours', () => {
      expect(formatTimeAgo(agoMs(hr(24)))).toBe('1 day ago')
      expect(formatTimeAgo(agoMs(day(2)))).toBe('2 days ago')
      expect(formatTimeAgo(agoMs(day(29)))).toBe('29 days ago')
    })
  })

  describe('months bucket (< 12 months, 30-day months)', () => {
    it('uses 30-day months approximation and pluralizes', () => {
      expect(formatTimeAgo(agoMs(day(30)))).toBe('1 month ago')
      expect(formatTimeAgo(agoMs(day(59)))).toBe('1 month ago') // still 1 month
      expect(formatTimeAgo(agoMs(day(60)))).toBe('2 months ago')
      expect(formatTimeAgo(agoMs(day(30 * 11 + 29)))).toBe('11 months ago')
    })
  })

  describe('years bucket (365-day years)', () => {
    it('uses 365-day years approximation and pluralizes', () => {
      expect(formatTimeAgo(agoMs(day(365)))).toBe('1 year ago')
      expect(formatTimeAgo(agoMs(day(366)))).toBe('1 year ago')
      expect(formatTimeAgo(agoMs(day(365 * 2)))).toBe('2 years ago')
    })
  })

  describe('input types', () => {
    it('accepts Date instances', () => {
      expect(formatTimeAgo(new Date('2025-01-01T11:00:00.000Z'))).toBe(
        '1 hour ago',
      )
    })

    it('accepts ISO strings', () => {
      expect(formatTimeAgo('2025-01-01T11:59:00.000Z')).toBe('1 minute ago')
    })
  })

  describe('invalid input behavior (current implementation)', () => {
    it('returns "NaN years ago" for invalid/undefined inputs', () => {
      expect(formatTimeAgo(undefined)).toBe('NaN years ago')
      expect(formatTimeAgo('not-a-date')).toBe('NaN years ago')
    })
  })
})

describe('formatLocalDate', () => {
  const pad2 = (n: number) => String(n).padStart(2, '0')

  const localDateTime = (date: Date) => {
    const yyyy = String(date.getFullYear()).padStart(4, '0')
    const mm = pad2(date.getMonth() + 1)
    const dd = pad2(date.getDate())
    const hh = pad2(date.getHours())
    const min = pad2(date.getMinutes())
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
  }

  const localDateTimeSeconds = (date: Date) => {
    const yyyy = String(date.getFullYear()).padStart(4, '0')
    const mm = pad2(date.getMonth() + 1)
    const dd = pad2(date.getDate())
    const hh = pad2(date.getHours())
    const min = pad2(date.getMinutes())
    const ss = pad2(date.getSeconds())
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  it('formats Date instances in the browser timezone', () => {
    const date = new Date('2025-12-05T13:33:58.983Z')

    expect(formatLocalDate(date, DATE_FORMATS.DATE_TIME)).toBe(
      localDateTime(date),
    )
  })

  it('formats ISO 8601 strings in the browser timezone', () => {
    const iso = '2025-12-05T13:33:58.983Z'
    const date = new Date(iso)

    expect(formatLocalDate(iso, DATE_FORMATS.DATE_TIME_SECONDS)).toBe(
      localDateTimeSeconds(date),
    )
  })

  it('produces identical output for Date and ISO string inputs representing the same instant', () => {
    const date = new Date('2025-12-05T13:33:58.983Z')
    const iso = '2025-12-05T13:33:58.983Z'

    expect(formatLocalDate(date, DATE_FORMATS.DATE_TIME_SECONDS)).toBe(
      formatLocalDate(iso, DATE_FORMATS.DATE_TIME_SECONDS),
    )
  })
})
