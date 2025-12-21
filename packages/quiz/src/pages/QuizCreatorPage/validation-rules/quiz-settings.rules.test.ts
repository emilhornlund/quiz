import {
  LanguageCode,
  QUIZ_DESCRIPTION_MAX_LENGTH,
  QUIZ_TITLE_MIN_LENGTH,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { describe, expect, it } from 'vitest'

import { validateDto } from '../../../validation'

import { quizSettingsRules } from './quiz-settings.rules'

const fieldsAsRecord = (fields: unknown): Record<string, boolean | undefined> =>
  fields as Record<string, boolean | undefined>

describe('quizSettingsRules (integration)', () => {
  it('should validate a happy-path settings DTO with only required fields', () => {
    const dto = {
      title: 'HELLO',
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto, quizSettingsRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should validate a happy-path settings DTO with optional fields provided', () => {
    const dto = {
      title: 'HELLO',
      description: 'INFO',
      imageCoverURL: 'https://example.com/cover.png',
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Private,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto, quizSettingsRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail when title is missing (required)', () => {
    const dto = {
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto as unknown, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'title', code: 'required' }),
      ]),
    )
    expect(fieldsAsRecord(res.fields).title).toBe(false)
  })

  it('should fail when title is too short (minLength)', () => {
    const dto = {
      title: 'A'.repeat(Math.max(0, QUIZ_TITLE_MIN_LENGTH - 1)),
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some((e) => e.path === 'title' && e.code === 'minLength'),
    ).toBe(true)
    expect(res.paths.title).toBe(false)
    expect(fieldsAsRecord(res.fields).title).toBe(false)
  })

  it('should not require description or imageCoverURL when missing (optionalKeys)', () => {
    const dto = {
      title: 'HELLO',
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto, quizSettingsRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail when description exceeds maxLength', () => {
    const dto = {
      title: 'HELLO',
      description: 'A'.repeat(QUIZ_DESCRIPTION_MAX_LENGTH + 1),
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some(
        (e) => e.path === 'description' && e.code === 'maxLength',
      ),
    ).toBe(true)
    expect(res.paths.description).toBe(false)
    expect(fieldsAsRecord(res.fields).description).toBe(false)
  })

  it('should fail when imageCoverURL is present but invalid (regex)', () => {
    const dto = {
      title: 'HELLO',
      imageCoverURL: 'not-a-url',
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some((e) => e.path === 'imageCoverURL' && e.code === 'regex'),
    ).toBe(true)
    expect(res.paths.imageCoverURL).toBe(false)
    expect(fieldsAsRecord(res.fields).imageCoverURL).toBe(false)
  })

  it('should fail when category is not in oneOf', () => {
    const dto = {
      title: 'HELLO',
      category: 'Nope',
      visibility: QuizVisibility.Public,
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto as unknown, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some((e) => e.path === 'category' && e.code === 'oneOf'),
    ).toBe(true)
    expect(res.paths.category).toBe(false)
    expect(fieldsAsRecord(res.fields).category).toBe(false)
  })

  it('should fail when visibility is not in oneOf', () => {
    const dto = {
      title: 'HELLO',
      category: Object.values(QuizCategory)[0],
      visibility: 'Nope',
      languageCode: Object.values(LanguageCode)[0],
    }

    const res = validateDto(dto as unknown, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some((e) => e.path === 'visibility' && e.code === 'oneOf'),
    ).toBe(true)
    expect(res.paths.visibility).toBe(false)
    expect(fieldsAsRecord(res.fields).visibility).toBe(false)
  })

  it('should fail when languageCode is not in oneOf', () => {
    const dto = {
      title: 'HELLO',
      category: Object.values(QuizCategory)[0],
      visibility: QuizVisibility.Public,
      languageCode: 'Nope',
    }

    const res = validateDto(dto as unknown, quizSettingsRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some((e) => e.path === 'languageCode' && e.code === 'oneOf'),
    ).toBe(true)
    expect(res.paths.languageCode).toBe(false)
    expect(fieldsAsRecord(res.fields).languageCode).toBe(false)
  })
})
