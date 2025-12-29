import {
  DEFAULT_QUIZ_PAGINATION_LIMIT,
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { parseNumber } from './helpers.ts'

type Sort = 'title' | 'created' | 'updated'
type Order = 'asc' | 'desc'

/**
 * Options for listing/profile quiz searches parsed from the URL query string.
 *
 * - Optional text, enum filters, and sort/order are `undefined` when not present or invalid.
 * - `limit` and `offset` always resolve to finite numbers (with sensible fallbacks).
 */
export type ProfileQuizzesOptions = {
  search?: string
  visibility?: QuizVisibility
  category?: QuizCategory
  languageCode?: LanguageCode
  mode?: GameMode
  sort?: Sort
  order?: Order
  limit: number
  offset: number
}

/**
 * Parses a string into a member of a string enum (or union-like record).
 * Returns `undefined` when the string is missing or not part of the enum values.
 */
const parseEnum = <T extends string>(
  enumObj: Record<string, string>,
  v: string | null,
): T | undefined => {
  if (!v) return undefined
  const values = Object.values(enumObj) as string[]
  return values.includes(v) ? (v as T) : undefined
}

/**
 * React hook that synchronizes quiz list filters with the URL query string.
 *
 * Reads the current `URLSearchParams` and exposes:
 * - `options`: a normalized `ProfileQuizzesOptions` object derived from the URL.
 * - `setOptions(patch)`: merges a partial update into the current options and writes a clean query string.
 *
 * Behavior:
 * - Omits `undefined`/empty values to keep the URL minimal.
 * - Uses sane defaults for pagination (`limit`: `DEFAULT_QUIZ_PAGINATION_LIMIT`, `offset`: `0`).
 * - Ignores invalid enum values (they become `undefined`).
 */
export function useQuizzesSearchOptions() {
  const [searchParams, setSearchParams] = useSearchParams()

  const options: ProfileQuizzesOptions = useMemo(() => {
    const search = searchParams.get('search') || undefined
    const visibility = parseEnum<QuizVisibility>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      QuizVisibility as any,
      searchParams.get('visibility'),
    )
    const category = parseEnum<QuizCategory>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      QuizCategory as any,
      searchParams.get('category'),
    )
    const languageCode = parseEnum<LanguageCode>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LanguageCode as any,
      searchParams.get('languageCode'),
    )
    const mode = parseEnum<GameMode>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      GameMode as any,
      searchParams.get('mode'),
    )
    const sort = parseEnum<Sort>(
      { title: 'title', created: 'created', updated: 'updated' },
      searchParams.get('sort'),
    )
    const order = parseEnum<Order>(
      { asc: 'asc', desc: 'desc' },
      searchParams.get('order'),
    )

    const limit = parseNumber(
      searchParams.get('limit'),
      DEFAULT_QUIZ_PAGINATION_LIMIT,
    )
    const offset = parseNumber(searchParams.get('offset'), 0)

    return {
      search,
      visibility,
      category,
      languageCode,
      mode,
      sort,
      order,
      limit,
      offset,
    }
  }, [searchParams])

  /**
   * Merge patch into current options and write to the URL.
   * - Omits undefined fields to keep the URL clean
   * - `replace` avoids spamming history during typing
   * - `resetOffset` is handy when filters change
   */
  const setOptions = (patch: Partial<ProfileQuizzesOptions>) => {
    const next: ProfileQuizzesOptions = {
      ...options,
      ...patch,
      offset: patch.offset ?? options.offset,
      limit: patch.limit ?? options.limit,
    }

    const params = new URLSearchParams()

    const setIf = (key: string, val?: string | number | undefined) => {
      if (val === undefined || val === '') return
      params.set(key, String(val))
    }

    setIf('search', next.search)
    setIf('visibility', next.visibility)
    setIf('category', next.category)
    setIf('languageCode', next.languageCode)
    setIf('mode', next.mode)
    setIf('sort', next.sort)
    setIf('order', next.order)
    setIf('limit', next.limit)
    setIf('offset', next.offset)

    setSearchParams(params)
  }

  return { options, setOptions }
}
