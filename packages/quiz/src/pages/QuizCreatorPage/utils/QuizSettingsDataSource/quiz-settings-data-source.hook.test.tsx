import { LanguageCode, QuizCategory, QuizVisibility } from '@quiz/common'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useQuizSettingsDataSource } from './quiz-settings-data-source.hook'
import type { QuizSettingsModel } from './quiz-settings-data-source.types.ts'

const makeValidSettings = (): QuizSettingsModel => ({
  title: 'My Quiz',
  description: undefined,
  imageCoverURL: undefined,
  category: QuizCategory.Other,
  visibility: QuizVisibility.Public,
  languageCode: LanguageCode.English,
})

describe('useQuizSettingsDataSource', () => {
  it('should expose initial settings with expected defaults', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    expect(result.current.settings).toEqual({
      title: undefined,
      description: undefined,
      imageCoverURL: undefined,
      category: QuizCategory.Other,
      visibility: QuizVisibility.Public,
      languageCode: LanguageCode.English,
    })
  })

  it('should expose initial validation for the initial settings', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    expect(typeof result.current.settingsValidation.valid).toBe('boolean')
    expect(Array.isArray(result.current.settingsValidation.errors)).toBe(true)
    expect(typeof result.current.allSettingsValid).toBe('boolean')
    expect(result.current.allSettingsValid).toBe(
      result.current.settingsValidation.valid,
    )
  })

  it('should update a single field via updateSettingsField', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.updateSettingsField('title', 'My Quiz')
    })

    expect(result.current.settings.title).toBe('My Quiz')
    expect(result.current.settings.category).toBe(QuizCategory.Other)
    expect(result.current.settings.visibility).toBe(QuizVisibility.Public)
    expect(result.current.settings.languageCode).toBe(LanguageCode.English)
  })

  it('should allow clearing a field by setting it to undefined', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.updateSettingsField('title', 'My Quiz')
    })
    expect(result.current.settings.title).toBe('My Quiz')

    act(() => {
      result.current.updateSettingsField('title', undefined)
    })
    expect(result.current.settings.title).toBeUndefined()
  })

  it('should make settings valid when populated with a minimal valid payload (based on rules)', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.setSettings(makeValidSettings())
    })

    expect(result.current.settingsValidation.valid).toBe(true)
    expect(result.current.allSettingsValid).toBe(true)
    expect(result.current.settingsValidation.errors).toHaveLength(0)
  })

  it('should become invalid if a required field is cleared after being valid', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.setSettings(makeValidSettings())
    })
    expect(result.current.settingsValidation.valid).toBe(true)

    act(() => {
      result.current.updateSettingsField('title', undefined)
    })

    expect(result.current.settingsValidation.valid).toBe(false)
    expect(result.current.allSettingsValid).toBe(false)
    expect(result.current.settingsValidation.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'title' })]),
    )
  })

  it('should validate optional description without affecting validity when other fields are valid', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.setSettings(makeValidSettings())
    })
    expect(result.current.settingsValidation.valid).toBe(true)

    act(() => {
      result.current.updateSettingsField('description', 'A short description')
    })

    expect(result.current.settings.description).toBe('A short description')
    expect(result.current.settingsValidation.valid).toBe(true)
  })

  it('should validate optional imageCoverURL format when provided', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.setSettings(makeValidSettings())
    })
    expect(result.current.settingsValidation.valid).toBe(true)

    act(() => {
      result.current.updateSettingsField(
        'imageCoverURL',
        'https://example.com/cover.png',
      )
    })

    expect(result.current.settings.imageCoverURL).toBe(
      'https://example.com/cover.png',
    )
    expect(result.current.settingsValidation.valid).toBe(true)
    expect(result.current.settingsValidation.errors).toHaveLength(0)
  })

  it('should fail validation when imageCoverURL is provided with an invalid URL', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    act(() => {
      result.current.setSettings(makeValidSettings())
    })
    expect(result.current.settingsValidation.valid).toBe(true)

    act(() => {
      result.current.updateSettingsField('imageCoverURL', 'not-a-url')
    })

    expect(result.current.settingsValidation.valid).toBe(false)
    expect(result.current.settingsValidation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'imageCoverURL' }),
      ]),
    )
  })

  it('should recompute validation when settings changes across renders', () => {
    const { result } = renderHook(() => useQuizSettingsDataSource())

    const firstValidation = result.current.settingsValidation

    act(() => {
      result.current.updateSettingsField('title', 'My Quiz')
    })

    const secondValidation = result.current.settingsValidation

    expect(secondValidation).not.toBe(firstValidation)
    expect(result.current.settings.title).toBe('My Quiz')
  })
})
