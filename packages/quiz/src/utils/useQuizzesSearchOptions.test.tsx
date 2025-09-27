import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useQuizzesSearchOptions } from './useQuizzesSearchOptions'

vi.mock('@quiz/common', () => ({
  DEFAULT_QUIZ_PAGINATION_LIMIT: 25,
  GameMode: { Classic: 'Classic', ZeroToOneHundred: 'ZeroToOneHundred' },
  LanguageCode: { EN: 'EN', SV: 'SV' },
  QuizCategory: { General: 'General', Science: 'Science' },
  QuizVisibility: { Public: 'Public', Private: 'Private' },
}))

const setSearchParamsMock = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await (orig as any)()
  return {
    ...actual,
    useSearchParams: vi.fn(),
  }
})

const { useSearchParams } = (await import('react-router-dom')) as unknown as {
  useSearchParams: ReturnType<typeof vi.fn>
}

const setupSearchParams = (query: string) => {
  setSearchParamsMock.mockClear()
  const params = new URLSearchParams(query)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(useSearchParams as any).mockReturnValue([params, setSearchParamsMock])
}

describe('useQuizzesSearchOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns sensible defaults when no params are present', () => {
    setupSearchParams('')

    const { result } = renderHook(() => useQuizzesSearchOptions())
    const { options } = result.current

    expect(options.search).toBeUndefined()
    expect(options.visibility).toBeUndefined()
    expect(options.category).toBeUndefined()
    expect(options.languageCode).toBeUndefined()
    expect(options.mode).toBeUndefined()
    expect(options.sort).toBeUndefined()
    expect(options.order).toBeUndefined()
    expect(options.limit).toBe(25)
    expect(options.offset).toBe(0)
  })

  it('parses valid enums and simple fields from query', () => {
    setupSearchParams(
      [
        'search=react',
        'visibility=Public',
        'category=Science',
        'languageCode=EN',
        'mode=Classic',
        'sort=updated',
        'order=desc',
        'limit=50',
        'offset=10',
      ].join('&'),
    )

    const { result } = renderHook(() => useQuizzesSearchOptions())
    const { options } = result.current

    expect(options.search).toBe('react')
    expect(options.visibility).toBe('Public')
    expect(options.category).toBe('Science')
    expect(options.languageCode).toBe('EN')
    expect(options.mode).toBe('Classic')
    expect(options.sort).toBe('updated')
    expect(options.order).toBe('desc')
    expect(options.limit).toBe(50)
    expect(options.offset).toBe(10)
  })

  it('ignores invalid enum values (become undefined)', () => {
    setupSearchParams(
      [
        'visibility=Nope',
        'category=???',
        'languageCode=XX',
        'mode=Arcade',
        'sort=latest',
        'order=sideways',
      ].join('&'),
    )

    const { result } = renderHook(() => useQuizzesSearchOptions())
    const { options } = result.current

    expect(options.visibility).toBeUndefined()
    expect(options.category).toBeUndefined()
    expect(options.languageCode).toBeUndefined()
    expect(options.mode).toBeUndefined()
    expect(options.sort).toBeUndefined()
    expect(options.order).toBeUndefined()
  })

  it('falls back for invalid or missing limit/offset', () => {
    setupSearchParams('limit=NaN&offset=potato')

    const { result } = renderHook(() => useQuizzesSearchOptions())
    const { options } = result.current

    expect(options.limit).toBe(25)
    expect(options.offset).toBe(0)
  })

  it('keeps empty search undefined (not empty string)', () => {
    setupSearchParams('search=')

    const { result } = renderHook(() => useQuizzesSearchOptions())
    expect(result.current.options.search).toBeUndefined()
  })

  describe('setOptions', () => {
    it('writes a fresh, clean query string with merged values', () => {
      setupSearchParams(
        [
          'search=foo',
          'visibility=Public',
          'category=General',
          'languageCode=SV',
          'mode=Classic',
          'sort=title',
          'order=asc',
          'limit=25',
          'offset=0',
        ].join('&'),
      )

      const { result } = renderHook(() => useQuizzesSearchOptions())

      act(() => {
        result.current.setOptions({
          search: 'bar',
          order: 'desc',
        })
      })

      expect(setSearchParamsMock).toHaveBeenCalledTimes(1)
      const arg = setSearchParamsMock.mock.calls[0][0] as URLSearchParams
      const qs = arg.toString()

      expect(qs).toContain('search=bar')
      expect(qs).toContain('order=desc')

      expect(qs).toContain('visibility=Public')
      expect(qs).toContain('category=General')
      expect(qs).toContain('languageCode=SV')
      expect(qs).toContain('mode=Classic')
      expect(qs).toContain('sort=title')

      expect(qs).toContain('limit=25')
      expect(qs).toContain('offset=0')
    })

    it('omits undefined values to keep the URL minimal (e.g., clearing filters)', () => {
      setupSearchParams(
        [
          'search=foo',
          'visibility=Private',
          'category=Science',
          'languageCode=EN',
          'mode=ZeroToOneHundred',
          'sort=created',
          'order=asc',
          'limit=50',
          'offset=100',
        ].join('&'),
      )

      const { result } = renderHook(() => useQuizzesSearchOptions())

      act(() => {
        result.current.setOptions({
          search: undefined,
          visibility: undefined,
          category: undefined,
          languageCode: undefined,
          mode: undefined,
          sort: undefined,
          order: undefined,
        })
      })

      const arg = setSearchParamsMock.mock.calls[0][0] as URLSearchParams
      const qs = arg.toString()

      expect(qs).not.toContain('search=')
      expect(qs).not.toContain('visibility=')
      expect(qs).not.toContain('category=')
      expect(qs).not.toContain('languageCode=')
      expect(qs).not.toContain('mode=')
      expect(qs).not.toContain('sort=')
      expect(qs).not.toContain('order=')

      expect(qs).toContain('limit=50')
      expect(qs).toContain('offset=100')
    })

    it('updates pagination explicitly when provided', () => {
      setupSearchParams('limit=25&offset=0')

      const { result } = renderHook(() => useQuizzesSearchOptions())

      act(() => {
        result.current.setOptions({ limit: 10, offset: 30 })
      })

      const arg = setSearchParamsMock.mock.calls[0][0] as URLSearchParams
      const qs = arg.toString()
      expect(qs).toContain('limit=10')
      expect(qs).toContain('offset=30')
    })

    it('does not stringify empty string values (treats them as omitted)', () => {
      setupSearchParams('')

      const { result } = renderHook(() => useQuizzesSearchOptions())

      act(() => {
        result.current.setOptions({ search: '' })
      })

      const arg = setSearchParamsMock.mock.calls[0][0] as URLSearchParams
      const qs = arg.toString()
      expect(qs).not.toContain('search=')
    })
  })
})
