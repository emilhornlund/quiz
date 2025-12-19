import { LanguageCode, QuizCategory, QuizVisibility } from '@quiz/common'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useQuizSettingsDataSource } from './quiz-settings-data-source.hook.tsx'
import type { QuizSettingsData } from './quiz-settings-data-source.types.ts'

describe('useQuizSettingsDataSource', () => {
  it('returns the expected initial values and valid=false', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    expect(result.current.values).toEqual({
      title: undefined,
      description: undefined,
      imageCoverURL: undefined,
      category: QuizCategory.Other,
      visibility: QuizVisibility.Public,
      languageCode: LanguageCode.English,
    })

    expect(result.current.valid).toBe(false)
  })

  it('updates values via onValueChange without recomputing validity', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    expect(result.current.valid).toBe(false)

    act(() => {
      result.current.onValueChange('title', 'My quiz')
    })

    expect(result.current.values.title).toBe('My quiz')

    // onValueChange does not recompute validation, so overall valid should not change.
    expect(result.current.valid).toBe(false)
  })

  it('recomputes validity when setValues is called', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    const newValues: QuizSettingsData = {
      title: 'NewTitle',
      description: undefined,
      imageCoverURL: undefined,
      category: QuizCategory.Other,
      visibility: QuizVisibility.Public,
      languageCode: LanguageCode.English,
    }

    act(() => {
      result.current.setValues(newValues)
    })

    expect(result.current.values).toEqual(newValues)
    expect(result.current.valid).toBe(true)
  })

  it('allows field-level validators to flip overall validity via onValidChange', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    expect(result.current.valid).toBe(false)

    act(() => {
      result.current.onValidChange('title', true)
    })

    expect(result.current.valid).toBe(true)

    act(() => {
      result.current.onValidChange('title', false)
    })

    expect(result.current.valid).toBe(false)
  })

  it('setValues can make the model valid, and onValidChange can later override it', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    const newValues: QuizSettingsData = {
      title: 'NewTitle',
      description: undefined,
      imageCoverURL: undefined,
      category: QuizCategory.Other,
      visibility: QuizVisibility.Public,
      languageCode: LanguageCode.English,
    }

    act(() => {
      result.current.setValues(newValues)
    })

    expect(result.current.valid).toBe(true)

    act(() => {
      result.current.onValidChange('title', false)
    })

    expect(result.current.valid).toBe(false)
  })
})
