/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata'

import { GameMode, QuestionType } from '@quiz/common'
import { validate } from 'class-validator'

import { reduceNestedValidationErrors } from '../../../../app/utils'

import { CreateZeroToOneHundredModeGameRequest } from './create-zero-to-one-hundred-mode-game.request'
import { CreateZeroToOneHundredModeQuestionRangeRequest } from './create-zero-to-one-hundred-mode-question-range.request'

function buildCreateZeroToOneHundredModeQuestionRangeRequest(): CreateZeroToOneHundredModeQuestionRangeRequest {
  const question = new CreateZeroToOneHundredModeQuestionRangeRequest()
  question.type = QuestionType.Range
  question.question = 'Sample range question'
  question.imageURL = 'http://example.com/image.png'
  question.correct = 50
  question.duration = 30
  return question
}

async function validateReduceNestedValidationErrors(object: object) {
  const errors = await validate(object)
  return reduceNestedValidationErrors(errors)
}

describe('CreateZeroToOneHundredModeGameRequest', () => {
  let gameRequest: CreateZeroToOneHundredModeGameRequest

  beforeEach(() => {
    gameRequest = new CreateZeroToOneHundredModeGameRequest()
    gameRequest.name = 'Sample Game'
    gameRequest.mode = GameMode.ZeroToOneHundred
    gameRequest.questions = [
      buildCreateZeroToOneHundredModeQuestionRangeRequest(),
    ]
  })

  describe('Game Name Validation', () => {
    it('should fail if game name is not a string', async () => {
      ;(gameRequest.name as any) = 123 // Invalid, should be a string
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(1)
      expect(errors).toEqual([
        {
          property: 'name',
          constraints: {
            isString: 'name must be a string',
            minLength: 'name must be longer than or equal to 3 characters',
            maxLength: 'name must be shorter than or equal to 25 characters',
          },
        },
      ])
    })

    it('should succeed if game name length is equal to 3', async () => {
      gameRequest.name = 'abc' // Valid, length 3
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(0)
    })

    it('should fail if game name length is less than 3', async () => {
      gameRequest.name = 'ab' // Invalid, length less than 3
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(1)
      expect(errors).toEqual([
        {
          property: 'name',
          constraints: {
            minLength: 'name must be longer than or equal to 3 characters',
          },
        },
      ])
    })

    it('should succeed if game name length is equal to 25', async () => {
      gameRequest.name = 'a'.repeat(25) // Valid, length 25
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(0)
    })

    it('should fail if game name length is greater than 25', async () => {
      gameRequest.name = 'a'.repeat(26) // Invalid, length greater than 25
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(1)
      expect(errors).toEqual([
        {
          property: 'name',
          constraints: {
            maxLength: 'name must be shorter than or equal to 25 characters',
          },
        },
      ])
    })
  })

  describe('Questions Array Validation', () => {
    it('should fail if question array is empty', async () => {
      gameRequest.questions = []
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(1)
      expect(errors).toEqual([
        {
          property: 'questions',
          constraints: {
            arrayMinSize: 'questions must contain at least 1 elements',
          },
        },
      ])
    })

    it('should fail if question array is not an array', async () => {
      ;(gameRequest.questions as any) = {} // Invalid, should be an array
      const errors = await validateReduceNestedValidationErrors(gameRequest)
      expect(errors.length).toBe(1)
      expect(errors).toEqual([
        {
          property: 'questions',
          constraints: {
            isArray: 'questions must be an array',
            arrayMinSize: 'questions must contain at least 1 elements',
          },
        },
      ])
    })
  })

  describe('Slider Question Validation', () => {
    beforeEach(() => {
      gameRequest.questions = [
        buildCreateZeroToOneHundredModeQuestionRangeRequest(),
      ]
    })

    describe('Question Field Validation', () => {
      it('should fail if question is not a string', async () => {
        ;(gameRequest.questions[0].question as any) = 123 // Invalid, should be a string
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.question',
            constraints: {
              isString: 'question must be a string',
              maxLength:
                'question must be shorter than or equal to 120 characters',
              minLength:
                'question must be longer than or equal to 3 characters',
            },
          },
        ])
      })

      it('should succeed if question length is equal to 3', async () => {
        gameRequest.questions[0].question = 'abc' // Valid, length 3
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if question length is less than 3', async () => {
        gameRequest.questions[0].question = 'ab' // Invalid, length less than 3
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.question',
            constraints: {
              minLength:
                'question must be longer than or equal to 3 characters',
            },
          },
        ])
      })

      it('should succeed if question length is equal to 120', async () => {
        gameRequest.questions[0].question = 'a'.repeat(120) // Valid, length 120
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if question length is greater than 120', async () => {
        gameRequest.questions[0].question = 'a'.repeat(121) // Invalid, length greater than 120
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.question',
            constraints: {
              maxLength:
                'question must be shorter than or equal to 120 characters',
            },
          },
        ])
      })
    })

    describe('ImageURL Field Validation', () => {
      it('should fail if imageURL is not a valid URL', async () => {
        gameRequest.questions[0].imageURL = 'invalid-url' // Invalid URL
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.imageURL',
            constraints: {
              isUrl: 'imageURL must be a URL address',
            },
          },
        ])
      })

      it('should succeed if imageURL is a valid URL', async () => {
        gameRequest.questions[0].imageURL = 'http://example.com/image.png' // Valid URL
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if imageURL is not provided (optional field)', async () => {
        gameRequest.questions[0].imageURL = undefined // imageURL is optional
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })
    })

    describe('Correct Field Validation', () => {
      it('should fail if correct is not a number', async () => {
        ;((
          gameRequest
            .questions[0] as CreateZeroToOneHundredModeQuestionRangeRequest
        ).correct as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              isNumber:
                'correct must be a number conforming to the specified constraints',
              min: 'correct must not be less than 0',
              max: 'correct must not be greater than 100',
            },
          },
        ])
      })

      it('should fail if correct is less than min', async () => {
        ;(
          gameRequest
            .questions[0] as CreateZeroToOneHundredModeQuestionRangeRequest
        ).correct = -1 // Invalid, should be greater than or equal 0
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              min: 'correct must not be less than 0',
            },
          },
        ])
      })

      it('should succeed if correct is equal to min', async () => {
        ;(
          gameRequest
            .questions[0] as CreateZeroToOneHundredModeQuestionRangeRequest
        ).correct = 0 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if correct is less than max', async () => {
        ;(
          gameRequest
            .questions[0] as CreateZeroToOneHundredModeQuestionRangeRequest
        ).correct = 101 // Invalid, should be less than or equal 100
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              max: 'correct must not be greater than 100',
            },
          },
        ])
      })

      it('should succeed if correct is equal to max', async () => {
        ;(
          gameRequest
            .questions[0] as CreateZeroToOneHundredModeQuestionRangeRequest
        ).correct = 100 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })
    })

    describe('Duration Field Validation', () => {
      it('should fail if duration is not a number', async () => {
        ;(gameRequest.questions[0].duration as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.duration',
            constraints: {
              isNumber:
                'duration must be a number conforming to the specified constraints',
              isIn: 'duration must be one of the following values: 5, 30, 60, 120',
            },
          },
        ])
      })

      it('should fail if duration is not valid', async () => {
        ;(gameRequest.questions[0].duration as any) = 1 // Invalid, should be a either 5, 30, 60, 120
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.duration',
            constraints: {
              isIn: 'duration must be one of the following values: 5, 30, 60, 120',
            },
          },
        ])
      })

      it('should succeed if duration is 5', async () => {
        ;(gameRequest.questions[0].duration as any) = 5 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if duration is 30', async () => {
        ;(gameRequest.questions[0].duration as any) = 30 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if duration is 60', async () => {
        ;(gameRequest.questions[0].duration as any) = 60 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if duration is 120', async () => {
        ;(gameRequest.questions[0].duration as any) = 120 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })
    })
  })
})
