import { GameMode, QuestionType } from '@quiz/common'

import { parseQuestionsJson } from './helpers.ts'

describe('parseQuestionsJson', () => {
  describe('Classic Mode Questions', () => {
    it('should parse a valid MULTI question', () => {
      const parsedJson = [
        {
          type: QuestionType.Multi,
          question: 'What is the capital of France?',
          imageURL: 'https://example.com/image.png',
          answers: [
            { value: 'Paris', correct: true },
            { value: 'Berlin', correct: false },
          ],
          points: 1000,
          duration: 30,
        },
      ]
      const result = parseQuestionsJson(parsedJson, GameMode.Classic)
      expect(result[0]).toEqual(parsedJson[0])
    })

    it('should throw error for MULTI question with invalid points value', () => {
      const parsedJson = [
        {
          type: QuestionType.Multi,
          question: 'What is the capital of France?',
          imageURL: 'https://example.com/image.png',
          answers: [
            { value: 'Paris', correct: true },
            { value: 'Berlin', correct: false },
          ],
          points: 1500, // Invalid points
          duration: 30,
        },
      ]
      expect(() => parseQuestionsJson(parsedJson, GameMode.Classic)).toThrow(
        "Invalid value for field 'points'. Value did not pass custom validation.",
      )
    })

    it('should throw error for MULTI question with invalid duration value', () => {
      const parsedJson = [
        {
          type: QuestionType.Multi,
          question: 'What is the capital of France?',
          imageURL: 'https://example.com/image.png',
          answers: [
            { value: 'Paris', correct: true },
            { value: 'Berlin', correct: false },
          ],
          points: 1000,
          duration: 10, // Invalid duration
        },
      ]
      expect(() => parseQuestionsJson(parsedJson, GameMode.Classic)).toThrow(
        "Invalid value for field 'duration'. Value did not pass custom validation.",
      )
    })

    it('should parse a valid TRUE_FALSE question', () => {
      const parsedJson = [
        {
          type: QuestionType.TrueFalse,
          question: 'The earth is flat.',
          imageURL: 'https://example.com/image.png',
          correct: false,
          points: 2000,
          duration: 60,
        },
      ]
      const result = parseQuestionsJson(parsedJson, GameMode.Classic)
      expect(result[0]).toEqual(parsedJson[0])
    })

    it('should throw error for TRUE_FALSE question with non-boolean correct value', () => {
      const parsedJson = [
        {
          type: QuestionType.TrueFalse,
          question: 'The earth is flat.',
          imageURL: 'https://example.com/image.png',
          correct: 'nope', // Invalid correct type
          points: 2000,
          duration: 60,
        },
      ]
      expect(() => parseQuestionsJson(parsedJson, GameMode.Classic)).toThrow(
        "Invalid type for field 'correct'. Expected boolean, got string",
      )
    })
  })

  describe('ZeroToOneHundred Mode Questions', () => {
    it('should parse a valid RANGE question', () => {
      const parsedJson = [
        {
          type: QuestionType.Range,
          question: 'What is the hottest temperature recorded on earth?',
          imageURL: 'https://example.com/image.png',
          correct: 56,
          points: 1000,
          duration: 5,
        },
      ]
      const result = parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred)
      expect(result[0]).toEqual(parsedJson[0])
    })

    it('should throw error for RANGE question with non-number correct value', () => {
      const parsedJson = [
        {
          type: QuestionType.Range,
          question: 'What is the hottest temperature recorded on earth?',
          imageURL: 'https://example.com/image.png',
          correct: 'fifty-six', // Invalid correct type
          points: 1000,
          duration: 5,
        },
      ]
      expect(() =>
        parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred),
      ).toThrow("Invalid type for field 'correct'. Expected number, got string")
    })

    it('should throw error for RANGE question with invalid points value', () => {
      const parsedJson = [
        {
          type: QuestionType.Range,
          question: 'What is the hottest temperature recorded on earth?',
          imageURL: 'https://example.com/image.png',
          correct: 56,
          points: 3000, // Invalid points
          duration: 5,
        },
      ]
      expect(() =>
        parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred),
      ).toThrow(
        "Invalid value for field 'points'. Value did not pass custom validation.",
      )
    })

    it('should throw error for RANGE question with invalid duration value', () => {
      const parsedJson = [
        {
          type: QuestionType.Range,
          question: 'What is the hottest temperature recorded on earth?',
          imageURL: 'https://example.com/image.png',
          correct: 56,
          points: 1000,
          duration: 10, // Invalid duration
        },
      ]
      expect(() =>
        parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred),
      ).toThrow(
        "Invalid value for field 'duration'. Value did not pass custom validation.",
      )
    })
  })

  describe('Unsupported Game Mode', () => {
    it('should throw an error for unsupported game mode', () => {
      const parsedJson = [
        {
          type: QuestionType.Multi,
          question: 'What is the capital of France?',
          imageURL: 'https://example.com/image.png',
          points: 1000,
          duration: 30,
        },
      ]
      // Type assertion is used here to bypass TypeScript's type check
      expect(() =>
        parseQuestionsJson(parsedJson, 'UNSUPPORTED_MODE' as GameMode),
      ).toThrow('Unsupported game mode')
    })
  })
})
