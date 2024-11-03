/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata'

import { GameMode, QuestionType } from '@quiz/common'
import { validate } from 'class-validator'

import { reduceNestedValidationErrors } from '../../../../app/utils'

import { CreateClassicModeGameRequest } from './create-classic-mode-game.request'
import { CreateClassicModeQuestionMultiChoiceAnswerRequest } from './create-classic-mode-question-multi-choice-answer.request'
import { CreateClassicModeQuestionMultiChoiceRequest } from './create-classic-mode-question-multi-choice.request'
import { CreateClassicModeQuestionRangeRequest } from './create-classic-mode-question-range.request'
import { CreateClassicModeQuestionTrueFalseRequest } from './create-classic-mode-question-true-false.request'
import { CreateClassicModeQuestionTypeAnswerRequest } from './create-classic-mode-question-type-answer.request'

function buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
  value: string,
  correct: boolean = false,
): CreateClassicModeQuestionMultiChoiceAnswerRequest {
  const request = new CreateClassicModeQuestionMultiChoiceAnswerRequest()
  request.value = value
  request.correct = correct
  return request
}

function buildCreateClassicModeQuestionMultiChoiceRequest(): CreateClassicModeQuestionMultiChoiceRequest {
  const question = new CreateClassicModeQuestionMultiChoiceRequest()
  question.type = QuestionType.MultiChoice
  question.question = 'Sample multi-choice question'
  question.imageURL = 'http://example.com/image.png'
  question.answers = [
    buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 1', true),
    buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 2'),
  ]
  question.points = 1000
  question.duration = 30
  return question
}

function buildCreateClassicModeQuestionTrueFalseRequest(): CreateClassicModeQuestionTrueFalseRequest {
  const question = new CreateClassicModeQuestionTrueFalseRequest()
  question.type = QuestionType.TrueFalse
  question.question = 'Sample true false question'
  question.imageURL = 'http://example.com/image.png'
  question.correct = true
  question.points = 1000
  question.duration = 30
  return question
}

function buildCreateClassicModeQuestionSliderRequest(): CreateClassicModeQuestionRangeRequest {
  const question = new CreateClassicModeQuestionRangeRequest()
  question.type = QuestionType.Range
  question.question = 'Sample range question'
  question.imageURL = 'http://example.com/image.png'
  question.min = 0
  question.max = 100
  question.correct = 50
  question.points = 1000
  question.duration = 30
  return question
}

function buildCreateClassicModeQuestionTypeAnswerRequest(): CreateClassicModeQuestionTypeAnswerRequest {
  const question = new CreateClassicModeQuestionTypeAnswerRequest()
  question.type = QuestionType.TypeAnswer
  question.question = 'Sample type answer question'
  question.imageURL = 'http://example.com/image.png'
  question.correct = 'TypedAnswer'
  question.points = 1000
  question.duration = 30
  return question
}

async function validateReduceNestedValidationErrors(object: object) {
  const errors = await validate(object)
  return reduceNestedValidationErrors(errors)
}

describe('CreateClassicModeGameRequest', () => {
  let gameRequest: CreateClassicModeGameRequest

  beforeEach(() => {
    gameRequest = new CreateClassicModeGameRequest()
    gameRequest.name = 'Sample Game'
    gameRequest.mode = GameMode.Classic
    gameRequest.questions = [buildCreateClassicModeQuestionMultiChoiceRequest()]
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

  describe('Multi-Option Question Validation', () => {
    beforeEach(() => {
      gameRequest.questions = [
        buildCreateClassicModeQuestionMultiChoiceRequest(),
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

    describe('Answers Array Validation', () => {
      it('should fail if answers array is not an array', async () => {
        ;((
          gameRequest
            .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
        ).answers as any) = {} // Invalid, should be an array
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.answers',
            constraints: {
              isArray: 'answers must be an array',
              arrayMinSize: 'answers must contain at least 2 elements',
              arrayMaxSize: 'answers must contain no more than 6 elements',
              atLeastOneCorrectAnswer:
                'At least one answer must be marked as correct',
            },
          },
        ])
      })

      it('should fail if answers array is empty', async () => {
        ;(
          gameRequest
            .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
        ).answers = [] // Invalid, should be empty
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.answers',
            constraints: {
              arrayMinSize: 'answers must contain at least 2 elements',
              atLeastOneCorrectAnswer:
                'At least one answer must be marked as correct',
            },
          },
        ])
      })

      it('should fail if answers array length is less than 2', async () => {
        ;(
          gameRequest
            .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
        ).answers = [
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
            'Answer 1',
            true,
          ),
        ] // Invalid, should contain at least 2 answers
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.answers',
            constraints: {
              arrayMinSize: 'answers must contain at least 2 elements',
            },
          },
        ])
      })

      it('should succeeds if answers array length is equal to 2', async () => {
        ;(
          gameRequest
            .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
        ).answers = [
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
            'Answer 1',
            true,
          ),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 2'),
        ] // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if answers array length is greater than 6', async () => {
        ;(
          gameRequest
            .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
        ).answers = [
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
            'Answer 1',
            true,
          ),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 2'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 3'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 4'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 5'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 6'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 7'),
        ] // Invalid, should contain at most 6 answers
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.answers',
            constraints: {
              arrayMaxSize: 'answers must contain no more than 6 elements',
            },
          },
        ])
      })

      it('should succeed if answers array length is equal to 6', async () => {
        ;(
          gameRequest
            .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
        ).answers = [
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
            'Answer 1',
            true,
          ),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 2'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 3'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 4'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 5'),
          buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 6'),
        ] // Invalid, should contain at most 6 answers
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      describe('Value Field Validation', () => {
        it('should fail if answer value is not a string', async () => {
          ;((
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].value as any) = 123 // Invalid, should be a string
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(1)
          expect(errors).toEqual([
            {
              property: 'questions.0.answers.0.value',
              constraints: {
                isString: 'value must be a string',
                minLength: 'value must be longer than or equal to 1 characters',
                maxLength:
                  'value must be shorter than or equal to 75 characters',
              },
            },
          ])
        })

        it('should succeed if answer value length is equal to 1', async () => {
          ;(
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].value = 'a' // Valid, length 1
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(0)
        })

        it('should fail if answer value length is less than 1', async () => {
          ;(
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].value = '' // Invalid, length less than 1
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(1)
          expect(errors).toEqual([
            {
              property: 'questions.0.answers.0.value',
              constraints: {
                minLength: 'value must be longer than or equal to 1 characters',
              },
            },
          ])
        })

        it('should succeed if answer value length is equal to 75', async () => {
          ;(
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].value = 'a'.repeat(75) // Valid, length 75
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(0)
        })

        it('should fail if answer value length is greater than 75', async () => {
          ;(
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].value = 'a'.repeat(76) // Invalid, length greater than 75
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(1)
          expect(errors).toEqual([
            {
              property: 'questions.0.answers.0.value',
              constraints: {
                maxLength:
                  'value must be shorter than or equal to 75 characters',
              },
            },
          ])
        })
      })

      describe('Correct Field Validation', () => {
        it('should fail if answer correct is undefined', async () => {
          ;((
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].correct as any) = undefined // Invalid, should be a boolean
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(2)
          expect(errors).toEqual([
            {
              property: 'questions.0.answers',
              constraints: {
                atLeastOneCorrectAnswer:
                  'At least one answer must be marked as correct',
              },
            },
            {
              property: 'questions.0.answers.0.correct',
              constraints: {
                isBoolean: 'correct must be a boolean value',
              },
            },
          ])
        })

        it('should fail if answer correct is not a boolean', async () => {
          ;((
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers[0].correct as any) = 123 // Invalid, should be a boolean
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(2)
          expect(errors).toEqual([
            {
              property: 'questions.0.answers',
              constraints: {
                atLeastOneCorrectAnswer:
                  'At least one answer must be marked as correct',
              },
            },
            {
              property: 'questions.0.answers.0.correct',
              constraints: {
                isBoolean: 'correct must be a boolean value',
              },
            },
          ])
        })

        it('should fail if no answers are marked correct', async () => {
          ;(
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers = [
            buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 1'),
            buildCreateClassicModeQuestionMultiChoiceAnswerRequest('Answer 2'),
          ] // Invalid, none are correct
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(1)
          expect(errors).toEqual([
            {
              property: 'questions.0.answers',
              constraints: {
                atLeastOneCorrectAnswer:
                  'At least one answer must be marked as correct',
              },
            },
          ])
        })

        it('should succeed if all answers are marked correct', async () => {
          ;(
            gameRequest
              .questions[0] as CreateClassicModeQuestionMultiChoiceRequest
          ).answers = [
            buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
              'Answer 1',
              true,
            ),
            buildCreateClassicModeQuestionMultiChoiceAnswerRequest(
              'Answer 2',
              true,
            ),
          ] // Valid
          const errors = await validateReduceNestedValidationErrors(gameRequest)
          expect(errors.length).toBe(0)
        })
      })
    })

    describe('Points Field Validation', () => {
      it('should fail if points is not a number', async () => {
        ;(gameRequest.questions[0].points as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isNumber:
                'points must be a number conforming to the specified constraints',
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should fail if points is not valid', async () => {
        ;(gameRequest.questions[0].points as any) = 1 // Invalid, should be a either 0, 1000, 2000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should succeed if points is 0', async () => {
        ;(gameRequest.questions[0].points as any) = 0 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 1000', async () => {
        ;(gameRequest.questions[0].points as any) = 1000 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 2000', async () => {
        ;(gameRequest.questions[0].points as any) = 2000 // Valid
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

  describe('True False Question Validation', () => {
    beforeEach(() => {
      gameRequest.questions = [buildCreateClassicModeQuestionTrueFalseRequest()]
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
      it('should fail if answer correct is undefined', async () => {
        ;((
          gameRequest.questions[0] as CreateClassicModeQuestionTrueFalseRequest
        ).correct as any) = undefined // Invalid, should be a boolean
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: { isBoolean: 'correct must be a boolean value' },
          },
        ])
      })

      it('should fail if answer correct is not a boolean', async () => {
        ;((
          gameRequest.questions[0] as CreateClassicModeQuestionTrueFalseRequest
        ).correct as any) = 123 // Invalid, should be a boolean
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: { isBoolean: 'correct must be a boolean value' },
          },
        ])
      })
    })

    describe('Points Field Validation', () => {
      it('should fail if points is not a number', async () => {
        ;(gameRequest.questions[0].points as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isNumber:
                'points must be a number conforming to the specified constraints',
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should fail if points is not valid', async () => {
        ;(gameRequest.questions[0].points as any) = 1 // Invalid, should be a either 0, 1000, 2000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should succeed if points is 0', async () => {
        ;(gameRequest.questions[0].points as any) = 0 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 1000', async () => {
        ;(gameRequest.questions[0].points as any) = 1000 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 2000', async () => {
        ;(gameRequest.questions[0].points as any) = 2000 // Valid
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

  describe('Slider Question Validation', () => {
    beforeEach(() => {
      gameRequest.questions = [buildCreateClassicModeQuestionSliderRequest()]
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

    describe('Min Field Validation', () => {
      it('should fail if min is not a number', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .min as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(3)
        expect(errors).toEqual([
          {
            property: 'questions.0.min',
            constraints: {
              isNumber:
                'min must be a number conforming to the specified constraints',
              min: 'min must not be less than -10000',
              max: 'min must not be greater than 10000',
              minMaxValidator: 'min should not be greater than max',
            },
          },
          {
            property: 'questions.0.max',
            constraints: {
              minMaxValidator: 'min should not be greater than max',
            },
          },
          {
            property: 'questions.0.correct',
            constraints: {
              inRangeValidator:
                'correct must be within the range of min and max',
            },
          },
        ])
      })

      it('should fail if min is less than -10000', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .min as any) = -10000 - 1 // Invalid, should be greater than or equal to -10000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.min',
            constraints: {
              min: 'min must not be less than -10000',
            },
          },
        ])
      })

      it('should succeed if min is equal to -10000', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .min as any) = -10000 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if min is greater than 10000', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .min as any) = 10000 + 1 // Invalid, should be less than or equal to 10000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(3)
        expect(errors).toEqual([
          {
            property: 'questions.0.min',
            constraints: {
              max: 'min must not be greater than 10000',
              minMaxValidator: 'min should not be greater than max',
            },
          },
          {
            property: 'questions.0.max',
            constraints: {
              minMaxValidator: 'min should not be greater than max',
            },
          },
          {
            property: 'questions.0.correct',
            constraints: {
              inRangeValidator:
                'correct must be within the range of min and max',
            },
          },
        ])
      })

      it('should fail if min is greater than max', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .min as any) = 101
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(3)
        expect(errors).toContainEqual({
          property: 'questions.0.min',
          constraints: {
            minMaxValidator: 'min should not be greater than max',
          },
        })
      })
    })

    describe('Max Field Validation', () => {
      it('should fail if max is not a number', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .max as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.max',
            constraints: {
              isNumber:
                'max must be a number conforming to the specified constraints',
              min: 'max must not be less than -10000',
              max: 'max must not be greater than 10000',
            },
          },
        ])
      })

      it('should fail if max is greater than 10000', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .max as any) = 10000 + 1 // Invalid, should be less than or equal to 10000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.max',
            constraints: { max: 'max must not be greater than 10000' },
          },
        ])
      })

      it('should succeed if max is equal to 10000', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .max as any) = 10000 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if max is less than min', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .max as any) = -1
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(3)
        expect(errors).toContainEqual({
          property: 'questions.0.max',
          constraints: {
            minMaxValidator: 'min should not be greater than max',
          },
        })
      })
    })

    describe('Correct Field Validation', () => {
      it('should fail if correct is not a number', async () => {
        ;((gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest)
          .correct as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              isNumber:
                'correct must be a number conforming to the specified constraints',
              min: 'correct must not be less than -10000',
              max: 'correct must not be greater than 10000',
              inRangeValidator:
                'correct must be within the range of min and max',
            },
          },
        ])
      })

      it('should fail if correct is less than min', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest
        ).correct = -1 // Invalid, should be greater than or equal 0
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              inRangeValidator:
                'correct must be within the range of min and max',
            },
          },
        ])
      })

      it('should succeed if correct is equal to min', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest
        ).correct = 0 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if correct is less than max', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest
        ).correct = 101 // Invalid, should be less than or equal 100
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              inRangeValidator:
                'correct must be within the range of min and max',
            },
          },
        ])
      })

      it('should succeed if correct is equal to max', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionRangeRequest
        ).correct = 100 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })
    })

    describe('Points Field Validation', () => {
      it('should fail if points is not a number', async () => {
        ;(gameRequest.questions[0].points as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isNumber:
                'points must be a number conforming to the specified constraints',
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should fail if points is not valid', async () => {
        ;(gameRequest.questions[0].points as any) = 1 // Invalid, should be a either 0, 1000, 2000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should succeed if points is 0', async () => {
        ;(gameRequest.questions[0].points as any) = 0 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 1000', async () => {
        ;(gameRequest.questions[0].points as any) = 1000 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 2000', async () => {
        ;(gameRequest.questions[0].points as any) = 2000 // Valid
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

  describe('Type Answer Question Validation', () => {
    beforeEach(() => {
      gameRequest.questions = [
        buildCreateClassicModeQuestionTypeAnswerRequest(),
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
      it('should fail if correct is not a string', async () => {
        ;((
          gameRequest.questions[0] as CreateClassicModeQuestionTypeAnswerRequest
        ).correct as any) = 123 // Invalid, should be a string
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              isString: 'correct must be a string',
              maxLength:
                'correct must be shorter than or equal to 75 characters',
              minLength: 'correct must be longer than or equal to 1 characters',
            },
          },
        ])
      })

      it('should succeed if correct length is equal to 1', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionTypeAnswerRequest
        ).correct = 'a' // Valid, length 1
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if correct length is less than 1', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionTypeAnswerRequest
        ).correct = '' // Invalid, length less than 1
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              minLength: 'correct must be longer than or equal to 1 characters',
            },
          },
        ])
      })

      it('should succeed if correct length is equal to 75', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionTypeAnswerRequest
        ).correct = 'a'.repeat(75) // Valid, length 75
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should fail if correct length is greater than 75', async () => {
        ;(
          gameRequest.questions[0] as CreateClassicModeQuestionTypeAnswerRequest
        ).correct = 'a'.repeat(76) // Invalid, length greater than 75
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.correct',
            constraints: {
              maxLength:
                'correct must be shorter than or equal to 75 characters',
            },
          },
        ])
      })
    })

    describe('Points Field Validation', () => {
      it('should fail if points is not a number', async () => {
        ;(gameRequest.questions[0].points as any) = '123' // Invalid, should be a number
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isNumber:
                'points must be a number conforming to the specified constraints',
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should fail if points is not valid', async () => {
        ;(gameRequest.questions[0].points as any) = 1 // Invalid, should be a either 0, 1000, 2000
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(1)
        expect(errors).toEqual([
          {
            property: 'questions.0.points',
            constraints: {
              isIn: 'points must be one of the following values: 0, 1000, 2000',
            },
          },
        ])
      })

      it('should succeed if points is 0', async () => {
        ;(gameRequest.questions[0].points as any) = 0 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 1000', async () => {
        ;(gameRequest.questions[0].points as any) = 1000 // Valid
        const errors = await validateReduceNestedValidationErrors(gameRequest)
        expect(errors.length).toBe(0)
      })

      it('should succeed if points is 2000', async () => {
        ;(gameRequest.questions[0].points as any) = 2000 // Valid
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
