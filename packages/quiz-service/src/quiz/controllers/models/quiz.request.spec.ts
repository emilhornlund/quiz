import {
  GameMode,
  LanguageCode,
  MediaType,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { validate } from 'class-validator'

import { QuizClassicRequest } from './quiz.request'

describe('QuizRequest', () => {
  const validData = {
    title: 'Trivia Battle',
    description: 'A fun and engaging trivia quiz for all ages.',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    category: QuizCategory.GeneralKnowledge,
    imageCoverURL: 'https://example.com/question-cover-image.png',
    languageCode: LanguageCode.English,
    questions: [
      {
        type: QuestionType.MultiChoice,
        question: 'What is the capital of Sweden?',
        media: {
          type: MediaType.Image,
          url: 'https://example.com/question-image.png',
        },
        options: [
          {
            value: 'Stockholm',
            correct: true,
          },
          {
            value: 'Copenhagen',
            correct: false,
          },
          {
            value: 'London',
            correct: false,
          },
          {
            value: 'Berlin',
            correct: false,
          },
        ],
        points: 1000,
        duration: 30,
      },
    ],
  }

  it('should pass validation with valid data', async () => {
    const response = Object.assign(new QuizClassicRequest(), validData)
    const errors = await validate(response)
    expect(errors).toHaveLength(0)
  })

  it('should fail if `title` is too short', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      title: 'Hi',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('title')
    expect(errors[0].constraints?.minLength).toBeDefined()
  })

  it('should fail if `title` exceeds the maximum length', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      title: 'A'.repeat(96),
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('title')
    expect(errors[0].constraints?.maxLength).toBeDefined()
  })

  it('should fail if `title` does not match the regex pattern', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      title: 'Invalid<>Title!!',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('title')
    expect(errors[0].constraints?.matches).toBeDefined()
  })

  it('should fail if `description` exceeds 500 characters', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      description: 'A'.repeat(501),
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('description')
    expect(errors[0].constraints?.maxLength).toBeDefined()
  })

  it('should pass if `description` is optional', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      description: undefined,
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(0)
  })

  it('should fail if `visibility` is not valid', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      visibility: 'not-valid',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('visibility')
  })

  it('should pass if `imageCoverURL` is optional', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      imageCoverURL: undefined,
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(0)
  })

  it('should fail if `imageCoverURL` is not a valid URL', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      imageCoverURL: 'not-a-valid-url',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('imageCoverURL')
  })

  it('should fail if `languageCode` is not a valid enum value', async () => {
    const response = Object.assign(new QuizClassicRequest(), {
      ...validData,
      languageCode: 'INVALID_LANGUAGE',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('languageCode')
  })
})
