import {
  type ClassicQuestionDto,
  MediaType,
  QuestionImageRevealEffectType,
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
  QUIZ_DURATION_ALLOWED,
  QUIZ_POINTS_ALLOWED,
} from '@quiz/common'
import { describe, expect, it } from 'vitest'

import { validateDiscriminatedDto } from '../../../validation'

import { classicQuestionRules } from './classic-question.rules'

const fieldsAsRecord = (fields: unknown): Record<string, boolean | undefined> =>
  fields as Record<string, boolean | undefined>

describe('classicQuestionRules (integration)', () => {
  it('should validate a happy-path MultiChoice question', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.MultiChoice,
      question: 'HELLO',
      options: [
        { value: 'A', correct: true },
        { value: 'B', correct: false },
      ],
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
      media: { type: MediaType.Image, url: 'https://example.com/a.png' },
      info: 'INFO',
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail MultiChoice when no option is marked correct (custom)', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.MultiChoice,
      question: 'HELLO',
      options: [
        { value: 'A', correct: false },
        { value: 'B', correct: false },
      ],
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some((e) => e.path === 'options' && e.code === 'custom'),
    ).toBe(true)
    expect(fieldsAsRecord(res.fields)['options']).toBe(false)
  })

  it('should fail when media.effect is provided for non-image media type', () => {
    const dto: unknown = {
      type: QuestionType.MultiChoice,
      question: 'HELLO',
      options: [
        { value: 'A', correct: true },
        { value: 'B', correct: false },
      ],
      points: 1000,
      duration: 30,
      media: {
        type: MediaType.Video,
        url: 'https://example.com/a.mp4',
        effect: QuestionImageRevealEffectType.Blur,
      },
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'media.effect', code: 'custom' }),
      ]),
    )
  })

  it('should validate a happy-path TrueFalse question', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.TrueFalse,
      question: 'HELLO',
      correct: true,
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
      media: { type: MediaType.Audio, url: 'https://example.com/a.mp3' },
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail TrueFalse when correct is missing (required)', () => {
    const dto: unknown = {
      type: QuestionType.TrueFalse,
      question: 'HELLO',
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'correct', code: 'required' }),
      ]),
    )
    expect(fieldsAsRecord(res.fields)['correct']).toBe(false)
  })

  it('should validate a happy-path Range question', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.Range,
      question: 'HELLO',
      min: 0,
      max: 10,
      correct: 5,
      margin: QuestionRangeAnswerMargin.None,
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
      media: { type: MediaType.Video, url: 'https://example.com/a.mp4' },
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail Range when min > max (custom on min/max)', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.Range,
      question: 'HELLO',
      min: 10,
      max: 0,
      correct: 5,
      margin: QuestionRangeAnswerMargin.None,
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(
      res.errors.some(
        (e) => (e.path === 'min' || e.path === 'max') && e.code === 'custom',
      ),
    ).toBe(true)
  })

  it('should validate a happy-path TypeAnswer question', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.TypeAnswer,
      question: 'HELLO',
      options: ['A', 'B'],
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
      info: 'INFO',
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail TypeAnswer when options is missing (required)', () => {
    const dto: unknown = {
      type: QuestionType.TypeAnswer,
      question: 'HELLO',
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'options', code: 'required' }),
      ]),
    )
    expect(fieldsAsRecord(res.fields)['options']).toBe(false)
  })

  it('should validate a happy-path Pin question', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.Pin,
      question: 'HELLO',
      imageURL: 'https://example.com/a.png',
      positionX: 0.5,
      positionY: 0.5,
      tolerance: QuestionPinTolerance.Medium,
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail Pin when imageURL is missing (required)', () => {
    const dto: unknown = {
      type: QuestionType.Pin,
      question: 'HELLO',
      positionX: 0.5,
      positionY: 0.5,
      tolerance: QuestionPinTolerance.Medium,
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'imageURL', code: 'required' }),
      ]),
    )
    expect(fieldsAsRecord(res.fields)['imageURL']).toBe(false)
  })

  it('should validate a happy-path Puzzle question', () => {
    const dto: ClassicQuestionDto = {
      type: QuestionType.Puzzle,
      question: 'HELLO',
      values: ['A', 'B', 'C'],
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
      media: { type: MediaType.Image, url: 'https://example.com/a.png' },
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(true)
    expect(res.errors).toHaveLength(0)
  })

  it('should fail Puzzle when values is missing (required)', () => {
    const dto: unknown = {
      type: QuestionType.Puzzle,
      question: 'HELLO',
      points: QUIZ_POINTS_ALLOWED[0],
      duration: QUIZ_DURATION_ALLOWED[0],
    }

    const res = validateDiscriminatedDto(dto, classicQuestionRules)

    expect(res.valid).toBe(false)
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'values', code: 'required' }),
      ]),
    )
    expect(fieldsAsRecord(res.fields)['values']).toBe(false)
  })
})
