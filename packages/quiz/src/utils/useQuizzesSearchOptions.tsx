import {
  DEFAULT_QUIZ_PAGINATION_LIMIT,
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type Sort = 'title' | 'created' | 'updated'
type Order = 'asc' | 'desc'

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

const parseNumber = (v: string | null, fallback: number) => {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

const parseEnum = <T extends string>(
  enumObj: Record<string, string>,
  v: string | null,
): T | undefined => {
  if (!v) return undefined
  const values = Object.values(enumObj) as string[]
  return values.includes(v) ? (v as T) : undefined
}

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
      visibility, // <- stays optional (undefined if not present)
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
