import { GameMode, MediaType, QuestionType } from '@quiz/common'
import { describe, expect, it } from 'vitest'

import { parseQuestionsJson } from './parse-questions-json'

describe('parseQuestionsJson', () => {
  it('should fail when root object is not an array', () => {
    expect(() => parseQuestionsJson({}, GameMode.Classic)).toThrow(
      'Unexpected root element. Expected array got object.',
    )
  })

  describe('Classic Mode Questions', () => {
    it('should parse a valid multi-choice question', () => {
      const parsedJson = [
        {
          type: QuestionType.MultiChoice,
          question: 'What is the capital of France?',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          options: [
            { value: 'Paris', correct: true },
            { value: 'Berlin', correct: false },
          ],
          points: 1000,
          duration: 30,
        },
      ]
      const result = parseQuestionsJson(parsedJson, GameMode.Classic)
      expect(result[0].data).toEqual(parsedJson[0])
    })

    it('should throw error for multi-choice question with invalid points value', () => {
      const parsedJson = [
        {
          type: QuestionType.MultiChoice,
          question: 'What is the capital of France?',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          options: [
            { value: 'Paris', correct: true },
            { value: 'Berlin', correct: false },
          ],
          points: 1500, // Invalid points
          duration: 30,
        },
      ]
      expect(() => parseQuestionsJson(parsedJson, GameMode.Classic)).toThrow(
        "Invalid value for field '[0].points'. Expected 0, 1000 or 2000.",
      )
    })

    it('should throw error for multi-choice question with invalid duration value', () => {
      const parsedJson = [
        {
          type: QuestionType.MultiChoice,
          question: 'What is the capital of France?',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          options: [
            { value: 'Paris', correct: true },
            { value: 'Berlin', correct: false },
          ],
          points: 1000,
          duration: 15, // Invalid duration
        },
      ]
      expect(() => parseQuestionsJson(parsedJson, GameMode.Classic)).toThrow(
        "Invalid value for field '[0].duration'. Expected 5, 10, 20, 30, 45, 60, 90, 120, 180 or 240.",
      )
    })

    it('should parse a valid TRUE_FALSE question', () => {
      const parsedJson = [
        {
          type: QuestionType.TrueFalse,
          question: 'The earth is flat.',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          correct: false,
          points: 2000,
          duration: 60,
        },
      ]
      const result = parseQuestionsJson(parsedJson, GameMode.Classic)
      expect(result[0].data).toEqual(parsedJson[0])
    })

    it('should throw error for TRUE_FALSE question with non-boolean correct value', () => {
      const parsedJson = [
        {
          type: QuestionType.TrueFalse,
          question: 'The earth is flat.',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
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
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          correct: 56,
          duration: 5,
        },
      ]
      const result = parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred)
      expect(result[0].data).toEqual(parsedJson[0])
    })

    it('should throw error for RANGE question with non-number correct value', () => {
      const parsedJson = [
        {
          type: QuestionType.Range,
          question: 'What is the hottest temperature recorded on earth?',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          correct: 'fifty-six', // Invalid correct type
          points: 1000,
          duration: 5,
        },
      ]
      expect(() =>
        parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred),
      ).toThrow("Invalid type for field 'correct'. Expected number, got string")
    })

    it('should throw error for RANGE question with invalid duration value', () => {
      const parsedJson = [
        {
          type: QuestionType.Range,
          question: 'What is the hottest temperature recorded on earth?',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
          correct: 56,
          points: 1000,
          duration: 15, // Invalid duration
        },
      ]
      expect(() =>
        parseQuestionsJson(parsedJson, GameMode.ZeroToOneHundred),
      ).toThrow(
        "Invalid value for field '[0].duration'. Expected 5, 10, 20, 30, 45, 60, 90, 120, 180 or 240.",
      )
    })
  })

  describe('Unsupported Game Mode', () => {
    it('should throw an error for unsupported game mode', () => {
      const parsedJson = [
        {
          type: QuestionType.MultiChoice,
          question: 'What is the capital of France?',
          media: {
            type: MediaType.Image,
            url: 'https://example.com/image.png',
          },
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
