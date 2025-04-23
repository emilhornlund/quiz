import {
  GameMode,
  GameParticipantType,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
} from '../../../quiz/services/models/schemas'
import {
  GameDocument,
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  TaskType,
} from '../models/schemas'

import {
  buildQuestionResultTask,
  calculateClassicModeRangeQuestionScore,
  calculateClassicModeRawScore,
  calculateClassicModeScore,
  calculateRangeMargin,
  calculateZeroToOneHundredModeScore,
  isQuestionAnswerCorrect,
} from './task.converter'

describe('TaskConverter', () => {
  describe('calculateRangeMargin', () => {
    it('should return 5% of correct for Low margin', () => {
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.Low, 100)).toEqual(
        5,
      )
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.Low, 200)).toEqual(
        10,
      )
    })

    it('should return 10% of correct for Medium margin', () => {
      expect(
        calculateRangeMargin(QuestionRangeAnswerMargin.Medium, 100),
      ).toEqual(10)
      expect(
        calculateRangeMargin(QuestionRangeAnswerMargin.Medium, 200),
      ).toEqual(20)
    })

    it('should return 20% of correct for High margin', () => {
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.High, 100)).toEqual(
        20,
      )
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.High, 200)).toEqual(
        40,
      )
    })

    it('should return Number.MAX_VALUE for Maximum margin', () => {
      expect(
        calculateRangeMargin(QuestionRangeAnswerMargin.Maximum, 100),
      ).toEqual(Number.MAX_VALUE)
      expect(
        calculateRangeMargin(QuestionRangeAnswerMargin.Maximum, 200),
      ).toEqual(Number.MAX_VALUE)
    })

    it('should return 0 for None margin', () => {
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.None, 100)).toEqual(
        0,
      )
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.None, 200)).toEqual(
        0,
      )
    })

    it('should handle negative correct values by using absolute value', () => {
      expect(calculateRangeMargin(QuestionRangeAnswerMargin.Low, -100)).toEqual(
        5,
      )
      expect(
        calculateRangeMargin(QuestionRangeAnswerMargin.Medium, -200),
      ).toEqual(20)
      expect(
        calculateRangeMargin(QuestionRangeAnswerMargin.High, -300),
      ).toEqual(60)
    })
  })

  describe('isQuestionAnswerCorrect', () => {
    describe('QuestionType is Multi Choice', () => {
      it('should validate correct multi-choice answers', () => {
        const question = {
          type: QuestionType.MultiChoice,
          options: [{ correct: true }, { correct: false }],
        } as BaseQuestionDao & QuestionMultiChoiceDao

        const answer = {
          type: QuestionType.MultiChoice,
          answer: 0,
        } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer
        expect(isQuestionAnswerCorrect(question, answer)).toBe(true)

        const wrongAnswer = {
          type: QuestionType.MultiChoice,
          answer: 1,
        } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer
        expect(isQuestionAnswerCorrect(question, wrongAnswer)).toBe(false)
      })

      it('should handle out-of-bounds multi-choice answers', () => {
        const question = {
          type: QuestionType.MultiChoice,
          options: [{ correct: true }, { correct: false }],
        } as BaseQuestionDao & QuestionMultiChoiceDao

        const answer = {
          type: QuestionType.MultiChoice,
          answer: 2,
        } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer
        expect(isQuestionAnswerCorrect(question, answer)).toBe(false)
      })

      it('should handle undefined answer', () => {
        const question = {
          type: QuestionType.MultiChoice,
          options: [{ correct: true }],
        } as BaseQuestionDao & QuestionMultiChoiceDao

        expect(
          isQuestionAnswerCorrect(question, {
            type: QuestionType.MultiChoice,
            answer: undefined,
          } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer),
        ).toBe(false)

        expect(isQuestionAnswerCorrect(question, undefined)).toBe(false)
      })
    })

    describe('QuestionType is Range', () => {
      it('should validate range questions with exact match for None margin', () => {
        const question = {
          type: QuestionType.Range,
          correct: 100,
          margin: QuestionRangeAnswerMargin.None,
        } as BaseQuestionDao & QuestionRangeDao

        const answer = {
          type: QuestionType.Range,
          answer: 100,
        } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
        expect(isQuestionAnswerCorrect(question, answer)).toBe(true)

        const wrongAnswer = {
          type: QuestionType.Range,
          answer: 101,
        } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
        expect(isQuestionAnswerCorrect(question, wrongAnswer)).toBe(false)
      })

      it('should validate range questions within Low margin', () => {
        const question = {
          type: QuestionType.Range,
          correct: 100,
          margin: QuestionRangeAnswerMargin.Low,
        } as BaseQuestionDao & QuestionRangeDao

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 95,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 5% margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 105,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 5% margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 94,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 5% margin
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 106,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 5% margin
          ),
        ).toBe(false)
      })

      it('should validate range questions within Medium margin', () => {
        const question = {
          type: QuestionType.Range,
          correct: 100,
          margin: QuestionRangeAnswerMargin.Medium,
        } as BaseQuestionDao & QuestionRangeDao

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 90,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 10% margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 110,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 10% margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 89,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 10% margin
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 111,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 10% margin
          ),
        ).toBe(false)
      })

      it('should validate range questions within High margin', () => {
        const question = {
          type: QuestionType.Range,
          correct: 100,
          margin: QuestionRangeAnswerMargin.High,
        } as BaseQuestionDao & QuestionRangeDao

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 80,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 20% margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 120,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 20% margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 79,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 20% margin
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 121,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 20% margin
          ),
        ).toBe(false)
      })

      it('should validate range questions within Maximum margin', () => {
        const question = {
          type: QuestionType.Range,
          correct: 100,
          margin: QuestionRangeAnswerMargin.Maximum,
        } as BaseQuestionDao & QuestionRangeDao

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 0,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within maximum margin
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            question,
            {
              type: QuestionType.Range,
              answer: 100,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within maximum margin
          ),
        ).toBe(true)
      })

      it('should handle undefined answer', () => {
        const question = {
          type: QuestionType.Range,
          correct: 100,
          margin: QuestionRangeAnswerMargin.None,
        } as BaseQuestionDao & QuestionRangeDao

        expect(
          isQuestionAnswerCorrect(question, {
            type: QuestionType.Range,
            answer: undefined,
          } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer),
        ).toBe(false)

        expect(isQuestionAnswerCorrect(question, undefined)).toBe(false)
      })
    })

    describe('QuestionType is True/False', () => {
      it('should validate correct true/false answers', () => {
        const question = {
          type: QuestionType.TrueFalse,
          correct: true,
        } as BaseQuestionDao & QuestionTrueFalseDao

        const answer = {
          type: QuestionType.TrueFalse,
          answer: true,
        } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer
        expect(isQuestionAnswerCorrect(question, answer)).toBe(true)

        const wrongAnswer = {
          type: QuestionType.TrueFalse,
          answer: false,
        } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer
        expect(isQuestionAnswerCorrect(question, wrongAnswer)).toBe(false)
      })

      it('should handle undefined answer', () => {
        const question = {
          type: QuestionType.TrueFalse,
          correct: true,
        } as BaseQuestionDao & QuestionTrueFalseDao

        expect(
          isQuestionAnswerCorrect(question, {
            type: QuestionType.TrueFalse,
            answer: undefined,
          } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer),
        ).toBe(false)

        expect(isQuestionAnswerCorrect(question, undefined)).toBe(false)
      })
    })

    describe('QuestionType is Type Answer', () => {
      it('should validate type answer questions with case-insensitive match', () => {
        const question = {
          type: QuestionType.TypeAnswer,
          options: ['OpenAI'],
        } as BaseQuestionDao & QuestionTypeAnswerDao

        const answer = {
          type: QuestionType.TypeAnswer,
          answer: 'openai',
        } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer
        expect(isQuestionAnswerCorrect(question, answer)).toBe(true)

        const wrongAnswer = {
          type: QuestionType.TypeAnswer,
          answer: 'wrong',
        } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer
        expect(isQuestionAnswerCorrect(question, wrongAnswer)).toBe(false)
      })

      it('should handle undefined answer', () => {
        const question = {
          type: QuestionType.TypeAnswer,
          options: ['OpenAI'],
        } as BaseQuestionDao & QuestionTypeAnswerDao

        expect(
          isQuestionAnswerCorrect(question, {
            type: QuestionType.TypeAnswer,
            answer: undefined,
          } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer),
        ).toBe(false)

        expect(isQuestionAnswerCorrect(question, undefined)).toBe(false)
      })
    })
  })

  describe('calculateClassicModeRawScore', () => {
    it('should calculate full score for very quick responses', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 1 second

      expect(
        calculateClassicModeRawScore(presented, question, answer),
      ).toBeCloseTo(983, 0)
    })

    it('should calculate reduced score for slower responses', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        created: new Date(presented.getTime() + 15000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 15 seconds

      expect(
        calculateClassicModeRawScore(presented, question, answer),
      ).toBeCloseTo(750, 0)
    })

    it('should calculate minimum score for responses at the duration limit', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        created: new Date(presented.getTime() + 30000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 30 seconds

      expect(
        calculateClassicModeRawScore(presented, question, answer),
      ).toBeCloseTo(500, 0)
    })

    it('should handle responses exceeding the duration', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        created: new Date(presented.getTime() + 60000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 60 seconds

      expect(calculateClassicModeRawScore(presented, question, answer)).toBe(0)
    })

    it('should return 0 points for a question with zero duration', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 0,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 1 second

      expect(calculateClassicModeRawScore(presented, question, answer)).toBe(0)
    })

    it('should calculate full points for responses at the exact presented time', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = { created: presented } as QuestionTaskBaseAnswer &
        QuestionTaskMultiChoiceAnswer // Exact time

      expect(calculateClassicModeRawScore(presented, question, answer)).toBe(
        1000,
      )
    })

    it('should handle negative response times gracefully', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        created: new Date(presented.getTime() - 5000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 5 seconds before presented

      expect(calculateClassicModeRawScore(presented, question, answer)).toBe(0)
    })
  })

  describe('calculateClassicModeRangeQuestionScore', () => {
    it('should calculate high score for fast and precise answers', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 100,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(983)
    })

    it('should calculate reduced score for slower but precise answers', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 100,
        created: new Date(presented.getTime() + 25000), // Answered in 25 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(917)
    })

    it('should calculate reduced score for fast but imprecise answers within margin', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 110,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(183)
    })

    it('should return 0 for answers outside the margin', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 115,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(0)
    })

    it('should calculate full score for Maximum margin regardless of precision', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Maximum,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 500,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(983)
    })

    it('should handle exact matches for None margin', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.None,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 100,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(983)
    })

    it('should handle answers at the exact duration limit', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 100,
        created: new Date(presented.getTime() + 30000), // Answered in 30 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        presented,
        question,
        answer,
      )
      expect(score).toEqual(900)
    })
  })

  describe('calculateClassicModeScore', () => {
    it('should calculate score for a multi-choice question and correct answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        options: [
          { value: 'correct answer', correct: true },
          { value: 'incorrect answer', correct: false },
        ],
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        type: QuestionType.MultiChoice,
        answer: 0,
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 1 second

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(983) // Speed-based calculation
    })

    it('should return 0 for a multi-choice question and incorrect answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.MultiChoice,
        options: [
          { value: 'correct answer', correct: true },
          { value: 'incorrect answer', correct: false },
        ],
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        type: QuestionType.MultiChoice,
        answer: 1,
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer // 1 second

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(0)
    })

    it('should calculate score for a range question', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 100,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(983) // Speed + precision-based calculation
    })

    it('should return 0 for undefined answers', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.TrueFalse,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionTrueFalseDao

      const score = calculateClassicModeScore(presented, question, undefined)
      expect(score).toEqual(0) // No answer provided
    })

    it('should return 0 for a range question with incorrect answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 100,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 200,
        created: new Date(presented.getTime() + 5000),
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(0) // Outside margin
    })

    it('should calculate score for a true/false question and correct answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.TrueFalse,
        correct: true,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionTrueFalseDao

      const answer = {
        type: QuestionType.TrueFalse,
        answer: true,
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer // 1 second

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(983) // Speed-based calculation
    })

    it('should return 0 for a true/false question and incorrect answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.TrueFalse,
        correct: true,
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionTrueFalseDao

      const answer = {
        type: QuestionType.TrueFalse,
        answer: false,
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer // 1 second

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(0)
    })

    it('should calculate score for a type-answer question and correct answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.TypeAnswer,
        options: ['correct answer'],
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionTypeAnswerDao

      const answer = {
        type: QuestionType.TypeAnswer,
        answer: 'correct answer',
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer // 1 second

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(983) // Speed-based calculation
    })

    it('should return 0 for a type-answer question and incorrect answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.TypeAnswer,
        options: ['correct answer'],
        duration: 30,
        points: 1000,
      } as BaseQuestionDao & QuestionTypeAnswerDao

      const answer = {
        type: QuestionType.TypeAnswer,
        answer: 'incorrect answer',
        created: new Date(presented.getTime() + 1000),
      } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer // 1 second

      const score = calculateClassicModeScore(presented, question, answer)
      expect(score).toEqual(0)
    })
  })

  describe('calculateZeroToOneHundredModeScore', () => {
    it('should return -10 for correct answers', () => {
      const question = {
        type: QuestionType.Range,
        correct: 50,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 50,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(-10)
    })

    it('should return absolute difference for incorrect answers within range', () => {
      const question = {
        type: QuestionType.Range,
        correct: 50,
      } as BaseQuestionDao & QuestionRangeDao

      let answer = {
        type: QuestionType.Range,
        answer: 55,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(5)

      answer = {
        type: QuestionType.Range,
        answer: 45,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(5)

      answer = {
        type: QuestionType.Range,
        answer: 0,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(50)

      answer = {
        type: QuestionType.Range,
        answer: 100,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(50)
    })

    it('should return 100 for out-of-range answers', () => {
      const question = {
        type: QuestionType.Range,
        correct: 50,
      } as BaseQuestionDao & QuestionRangeDao

      let answer = {
        type: QuestionType.Range,
        answer: -10,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(100)

      answer = {
        type: QuestionType.Range,
        answer: 120,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(100)
    })

    it('should return 100 for invalid questions or answers', () => {
      const question = {
        type: QuestionType.MultiChoice, // Invalid type
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        type: QuestionType.MultiChoice,
        answer: 0,
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer

      expect(calculateZeroToOneHundredModeScore(question, answer)).toEqual(100)

      expect(calculateZeroToOneHundredModeScore(question, undefined)).toEqual(
        100,
      )
    })
  })

  describe('buildQuestionResultTask', () => {
    it('should build a question result task item for a classic mode game when question type is multi choice', () => {
      const gameDocument = buildGameDocument(
        [
          {
            type: QuestionType.MultiChoice,
            text: 'What is the capital of Sweden?',
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
                value: 'Paris',
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
            duration: 5,
          },
        ],
        [
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: 0,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: 1,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_03,
            created: offset(5),
            answer: 2,
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.MultiChoice, index: 0 }],
        results: [
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: 0,
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.MultiChoice,
            },
            correct: true,
            lastScore: 900,
            totalScore: 900,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: 1,
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.MultiChoice,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_03,
            answer: {
              answer: 2,
              created: offset(5),
              playerId: PARTICIPANT_PLAYER_ID_03,
              type: QuestionType.MultiChoice,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is range', () => {
      const gameDocument = buildGameDocument(
        [
          {
            type: QuestionType.Range,
            text: 'Guess the temperature of the hottest day ever recorded.',
            media: {
              type: MediaType.Image,
              url: 'https://example.com/question-image.png',
            },
            min: 0,
            max: 100,
            margin: QuestionRangeAnswerMargin.Medium,
            step: 1,
            correct: 50,
            points: 1000,
            duration: 30,
          },
        ],
        [
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: 50,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: 40,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_03,
            created: offset(5),
            answer: 60,
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.Range, value: 50 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: 50,
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.Range,
            },
            correct: true,
            lastScore: 997,
            totalScore: 997,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: 40,
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.Range,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_03,
            answer: {
              answer: 60,
              created: offset(5),
              playerId: PARTICIPANT_PLAYER_ID_03,
              type: QuestionType.Range,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is true false', () => {
      const gameDocument = buildGameDocument(
        [
          {
            type: QuestionType.TrueFalse,
            text: 'The earth is flat.',
            media: {
              type: MediaType.Image,
              url: 'https://example.com/question-image.png',
            },
            correct: false,
            points: 1000,
            duration: 30,
          },
        ],
        [
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: false,
          },
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: true,
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.TrueFalse, value: false }],
        results: [
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: false,
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.TrueFalse,
            },
            correct: true,
            lastScore: 983,
            totalScore: 983,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: true,
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.TrueFalse,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_03,
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is type answer', () => {
      const gameDocument = buildGameDocument(
        [
          {
            type: QuestionType.TypeAnswer,
            text: 'What is the capital of Sweden?',
            media: {
              type: MediaType.Image,
              url: 'https://example.com/question-image.png',
            },
            options: ['stockholm'],
            points: 1000,
            duration: 30,
          },
        ],
        [
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: 'stockholm',
          },
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: 'copenhagen',
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.TypeAnswer, value: 'stockholm' }],
        results: [
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: 'stockholm',
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.TypeAnswer,
            },
            correct: true,
            lastScore: 983,
            totalScore: 983,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: 'copenhagen',
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.TypeAnswer,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_03,
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })
  })
})

const date = new Date('2025-04-09T14:43:03.687Z')
const offset = (seconds: number) => new Date(date.getTime() + seconds * 1000)

const PARTICIPANT_PLAYER_ID_01 = uuidv4()
const PARTICIPANT_PLAYER_ID_02 = uuidv4()
const PARTICIPANT_PLAYER_ID_03 = uuidv4()

function buildGameDocument(
  questions: QuestionDao[],
  answers: QuestionTaskAnswer[],
): GameDocument {
  return {
    _id: uuidv4(),
    name: 'Trivia Battle',
    mode: GameMode.Classic,
    pin: '123456',
    nextQuestion: 0,
    participants: [
      {
        type: GameParticipantType.HOST,
        client: { player: { _id: uuidv4() } },
      },
      {
        type: GameParticipantType.PLAYER,
        client: { player: { _id: PARTICIPANT_PLAYER_ID_01 } },
        totalScore: 0,
        currentStreak: 0,
      },
      {
        type: GameParticipantType.PLAYER,
        client: { player: { _id: PARTICIPANT_PLAYER_ID_02 } },
        totalScore: 0,
        currentStreak: 0,
      },
      {
        type: GameParticipantType.PLAYER,
        client: { player: { _id: PARTICIPANT_PLAYER_ID_03 } },
        totalScore: 0,
        currentStreak: 0,
      },
    ],
    questions,
    currentTask: {
      _id: uuidv4(),
      type: TaskType.Question,
      status: 'active',
      questionIndex: 0,
      answers,
      presented: offset(2),
      created: offset(1),
    },
    previousTasks: [],
    created: offset(0),
  } as GameDocument
}
