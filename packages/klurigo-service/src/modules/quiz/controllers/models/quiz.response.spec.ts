import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import { validate } from 'class-validator'

import { QuizResponse } from './quiz.response'

describe('QuizResponse', () => {
  const validData = {
    id: 'eaf37189-7aa7-455e-9e47-73db2a7d0a03',
    title: 'Trivia Battle',
    description: 'A fun and engaging trivia quiz for all ages.',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    category: QuizCategory.GeneralKnowledge,
    imageCoverURL: 'https://example.com/question-cover-image.png',
    languageCode: LanguageCode.English,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }

  it('should pass validation with valid data', async () => {
    const response = Object.assign(new QuizResponse(), validData)
    const errors = await validate(response)
    expect(errors).toHaveLength(0)
  })

  it('should fail if `id` is not a valid UUID', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      id: 'invalid-uuid',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('id')
  })

  it('should fail if `title` is too short', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      title: 'Hi',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('title')
    expect(errors[0].constraints?.minLength).toBeDefined()
  })

  it('should fail if `title` exceeds the maximum length', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      title: 'A'.repeat(96),
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('title')
    expect(errors[0].constraints?.maxLength).toBeDefined()
  })

  it('should fail if `title` does not match the regex pattern', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      title: 'Invalid<>Title!!',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('title')
    expect(errors[0].constraints?.matches).toBeDefined()
  })

  it('should fail if `description` exceeds 500 characters', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      description: 'A'.repeat(501),
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('description')
    expect(errors[0].constraints?.maxLength).toBeDefined()
  })

  it('should pass if `description` is optional', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      description: undefined,
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(0)
  })

  it('should fail if `visibility` is not valid', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      visibility: 'not-valid',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('visibility')
  })

  it('should pass if `imageCoverURL` is optional', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      imageCoverURL: undefined,
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(0)
  })

  it('should fail if `imageCoverURL` is not a valid URL', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      imageCoverURL: 'not-a-valid-url',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('imageCoverURL')
  })

  it('should fail if `languageCode` is not a valid enum value', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      languageCode: 'INVALID_LANGUAGE',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('languageCode')
  })

  it('should fail if `created` is not a valid ISO date string', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      created: 'not-a-date',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('created')
  })

  it('should fail if `updated` is not a valid ISO date string', async () => {
    const response = Object.assign(new QuizResponse(), {
      ...validData,
      updated: 'not-a-date',
    })
    const errors = await validate(response)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('updated')
  })
})
