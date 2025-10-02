import {
  GameMode,
  GameParticipantType,
  MediaType,
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockPinQuestionDocument,
  createMockPuzzleQuestionDocument,
  createMockQuestionTaskPinAnswer,
  createMockQuestionTaskPuzzleAnswer,
} from '../../../../test-utils/data'
import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
} from '../../../quiz/repositories/models/schemas'
import {
  GameDocument,
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskPinAnswer,
  QuestionTaskPuzzleAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  TaskType,
} from '../../repositories/models/schemas'

import {
  buildQuestionResultTask,
  calculateClassicModePinQuestionScore,
  calculateClassicModeRangeQuestionScore,
  calculateClassicModeScore,
  calculateZeroToOneHundredModeScore,
  isQuestionAnswerCorrect,
} from './task.converter'

describe('TaskConverter', () => {
  describe('isQuestionAnswerCorrect', () => {
    describe('QuestionType is Multi Choice', () => {
      it('should validate correct multi-choice answers', () => {
        const answer = {
          type: QuestionType.MultiChoice,
          answer: 0,
        } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.MultiChoice, index: 0 }],
            answer,
          ),
        ).toBe(true)

        const wrongAnswer = {
          type: QuestionType.MultiChoice,
          answer: 1,
        } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.MultiChoice, index: 0 }],
            wrongAnswer,
          ),
        ).toBe(false)
      })

      it('should handle out-of-bounds multi-choice answers', () => {
        const answer = {
          type: QuestionType.MultiChoice,
          answer: 2,
        } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.MultiChoice, index: 0 }],
            answer,
          ),
        ).toBe(false)
      })

      it('should handle undefined answer', () => {
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.MultiChoice, index: 0 }],
            {
              type: QuestionType.MultiChoice,
              answer: undefined,
            } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer,
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.MultiChoice, index: 0 }],
            undefined,
          ),
        ).toBe(false)
      })
    })

    describe('QuestionType is Range', () => {
      it('should validate range questions with exact match for None margin', () => {
        const range = {
          margin: QuestionRangeAnswerMargin.None,
          min: 0,
          max: 100,
          step: 2,
        }

        const answer = {
          type: QuestionType.Range,
          answer: 100,
        } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 100 }],
            answer,
            range,
          ),
        ).toBe(true)

        const wrongAnswer = {
          type: QuestionType.Range,
          answer: 101,
        } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 100 }],
            wrongAnswer,
            range,
          ),
        ).toBe(false)
      })

      it('should validate range questions within Low margin', () => {
        const range = {
          margin: QuestionRangeAnswerMargin.Low,
          min: 0,
          max: 100,
          step: 2,
        }

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 44,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 5% margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 56,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 5% margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 43,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 5% margin
            range,
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 57,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 5% margin
            range,
          ),
        ).toBe(false)
      })

      it('should validate range questions within Medium margin', () => {
        const range = {
          margin: QuestionRangeAnswerMargin.Medium,
          min: 0,
          max: 100,
          step: 2,
        }

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 40,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 10% margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 60,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 10% margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 39,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 10% margin
            range,
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 61,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 10% margin
            range,
          ),
        ).toBe(false)
      })

      it('should validate range questions within High margin', () => {
        const range = {
          margin: QuestionRangeAnswerMargin.High,
          min: 0,
          max: 100,
          step: 2,
        }

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 30,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 20% margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 70,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within 20% margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 29,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 20% margin
            range,
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 50 }],
            {
              type: QuestionType.Range,
              answer: 71,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Outside 20% margin
            range,
          ),
        ).toBe(false)
      })

      it('should validate range questions within Maximum margin', () => {
        const range = {
          margin: QuestionRangeAnswerMargin.Maximum,
          min: 0,
          max: 100,
          step: 2,
        }

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 100 }],
            {
              type: QuestionType.Range,
              answer: 0,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within maximum margin
            range,
          ),
        ).toBe(true)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 100 }],
            {
              type: QuestionType.Range,
              answer: 100,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer, // Within maximum margin
            range,
          ),
        ).toBe(true)
      })

      it('should handle undefined answer', () => {
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 100 }],
            {
              type: QuestionType.Range,
              answer: undefined,
            } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer,
            {
              margin: QuestionRangeAnswerMargin.None,
              min: 0,
              max: 100,
              step: 2,
            },
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.Range, value: 100 }],
            undefined,
          ),
        ).toBe(false)
      })
    })

    describe('QuestionType is True/False', () => {
      it('should validate correct true/false answers', () => {
        const answer = {
          type: QuestionType.TrueFalse,
          answer: true,
        } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TrueFalse, value: true }],
            answer,
          ),
        ).toBe(true)

        const wrongAnswer = {
          type: QuestionType.TrueFalse,
          answer: false,
        } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TrueFalse, value: true }],
            wrongAnswer,
          ),
        ).toBe(false)
      })

      it('should handle undefined answer', () => {
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TrueFalse, value: true }],
            {
              type: QuestionType.TrueFalse,
              answer: undefined,
            } as QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer,
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TrueFalse, value: true }],
            undefined,
          ),
        ).toBe(false)
      })
    })

    describe('QuestionType is Type Answer', () => {
      it('should validate type answer questions with case-insensitive match', () => {
        const answer = {
          type: QuestionType.TypeAnswer,
          answer: 'openai',
        } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TypeAnswer, value: 'OpenAI' }],
            answer,
          ),
        ).toBe(true)

        const wrongAnswer = {
          type: QuestionType.TypeAnswer,
          answer: 'wrong',
        } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TypeAnswer, value: 'OpenAI' }],
            wrongAnswer,
          ),
        ).toBe(false)
      })

      it('should handle undefined answer', () => {
        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TypeAnswer, value: 'OpenAI' }],
            {
              type: QuestionType.TypeAnswer,
              answer: undefined,
            } as QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer,
          ),
        ).toBe(false)

        expect(
          isQuestionAnswerCorrect(
            [{ type: QuestionType.TypeAnswer, value: 'OpenAI' }],
            undefined,
          ),
        ).toBe(false)
      })
    })

    describe('QuestionType is Pin', () => {
      describe('should validate Pin answers within Low tolerance (0.06)', () => {
        // Correct point at (0.50, 0.50)
        const correct = [
          {
            type: QuestionType.Pin,
            value: '0.50,0.50',
          },
        ]

        it('should be within 0.06 tolerance', () => {
          // 1) Within 0.06 tolerance (dx = 0.04, dy = 0) -> distance = 0.04 < 0.06
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.54,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Low,
            ),
          ).toBe(true)
        })

        it('should be exactly at 0.06 tolerance', () => {
          // 2) Exactly at 0.06 tolerance (dx = 0.06, dy = 0) -> distance = 0.06
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.56,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Low,
            ),
          ).toBe(true)
        })

        it('should be outside 0.06 tolerance', () => {
          // 3) Outside 0.06 tolerance (dx = 0.07, dy = 0) -> distance = 0.07 > 0.06
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.57,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Low,
            ),
          ).toBe(false)
        })
      })

      describe('should validate Pin answers within Medium tolerance (0.12)', () => {
        // Correct point at (0.50, 0.50)
        const correct = [
          {
            type: QuestionType.Pin,
            value: '0.50,0.50',
          },
        ]

        it('should be within 0.12 tolerance', () => {
          // Within 0.12 tolerance (dx = 0.10, dy = 0) -> distance = 0.10 < 0.12
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.60,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Medium,
            ),
          ).toBe(true)
        })

        it('should be exactly at 0.12 tolerance', () => {
          // Exactly at 0.12 tolerance (dx = 0.12, dy = 0) -> distance = 0.12
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.62,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Medium,
            ),
          ).toBe(true)
        })

        it('should be outside 0.12 tolerance', () => {
          // Outside 0.12 tolerance (dx = 0.13, dy = 0) -> distance = 0.13 > 0.12
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.63,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Medium,
            ),
          ).toBe(false)
        })
      })

      describe('should validate Pin answers within High tolerance (0.20)', () => {
        // Correct point at (0.50, 0.50)
        const correct = [
          {
            type: QuestionType.Pin,
            value: '0.50,0.50',
          },
        ]

        it('should be within 0.20 tolerance', () => {
          // Within 0.20 tolerance (dx = 0.15, dy = 0) -> distance = 0.15 < 0.20
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.65,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.High,
            ),
          ).toBe(true)
        })

        it('should be exactly at 0.20 tolerance', () => {
          // Exactly at 0.20 tolerance (dx = 0.20, dy = 0) -> distance = 0.20
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.70,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.High,
            ),
          ).toBe(true)
        })

        it('should be outside 0.20 tolerance', () => {
          // Outside 0.20 tolerance (dx = 0.21, dy = 0) -> distance = 0.21 > 0.20
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.71,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.High,
            ),
          ).toBe(false)
        })
      })

      describe('should validate Pin answers within Maximum tolerance (all answers correct)', () => {
        // Correct point at (0.50, 0.50)
        const correct = [
          {
            type: QuestionType.Pin,
            value: '0.50,0.50',
          },
        ]

        it('should be correct at the exact location', () => {
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.50,0.50',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Maximum,
            ),
          ).toBe(true)
        })

        it('should be correct far away from the correct location', () => {
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.95,0.95',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Maximum,
            ),
          ).toBe(true)
        })

        it('should be correct even at the opposite corner', () => {
          expect(
            isQuestionAnswerCorrect(
              correct,
              {
                type: QuestionType.Pin,
                answer: '0.00,0.00',
              } as unknown as QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
              undefined,
              QuestionPinTolerance.Maximum,
            ),
          ).toBe(true)
        })
      })
    })

    describe('QuestionType is Puzzle', () => {
      it('should be correct when order matches exactly', () => {
        const correct = [
          { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
        ]

        const answer = {
          type: QuestionType.Puzzle,
          answer: ['A', 'B', 'C', 'D'],
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        expect(isQuestionAnswerCorrect(correct, answer)).toBe(true)
      })

      it('should be correct when matching any of multiple valid orderings', () => {
        const correct = [
          { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
          { type: QuestionType.Puzzle, value: ['B', 'A', 'D', 'C'] }, // alternate valid ordering
        ]

        const answer = {
          type: QuestionType.Puzzle,
          answer: ['B', 'A', 'D', 'C'],
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        expect(isQuestionAnswerCorrect(correct, answer)).toBe(true)
      })

      it('should be correct when order does match some valid ordering', () => {
        const correct = [
          { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
          { type: QuestionType.Puzzle, value: ['B', 'A', 'D', 'C'] },
        ]

        const answer = {
          type: QuestionType.Puzzle,
          answer: ['A', 'C', 'B', 'D'],
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        expect(isQuestionAnswerCorrect(correct, answer)).toBe(true)
      })

      it('should be incorrect when order does not match any valid ordering', () => {
        const correct = [
          { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
          { type: QuestionType.Puzzle, value: ['B', 'A', 'D', 'C'] },
        ]

        const answer = {
          type: QuestionType.Puzzle,
          answer: ['C', 'D', 'A', 'B'], // not in the set of valid orderings
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        expect(isQuestionAnswerCorrect(correct, answer)).toBe(false)
      })

      it('should be incorrect when values are missing or extra', () => {
        const correct = [
          { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
        ]

        const missingOne = {
          type: QuestionType.Puzzle,
          answer: ['A', 'B', 'C'], // missing D
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        const extraOne = {
          type: QuestionType.Puzzle,
          answer: ['A', 'B', 'C', 'D', 'E'], // extra E
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        expect(isQuestionAnswerCorrect(correct, missingOne)).toBe(false)
        expect(isQuestionAnswerCorrect(correct, extraOne)).toBe(false)
      })

      it('should be incorrect when values match but casing differs', () => {
        const correct = [
          {
            type: QuestionType.Puzzle,
            value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
          },
        ]

        const answer = {
          type: QuestionType.Puzzle,
          answer: ['athens', 'argos', 'plovdiv', 'lisbon'], // case differs
        } as unknown as QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

        expect(isQuestionAnswerCorrect(correct, answer)).toBe(false)
      })
    })
  })

  describe('calculateClassicModeRangeQuestionScore', () => {
    it('should calculate high score for fast and precise answers', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 50,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        [{ type: QuestionType.Range, value: question.correct }],
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
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 50,
        created: new Date(presented.getTime() + 25000), // Answered in 25 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        [{ type: QuestionType.Range, value: question.correct }],
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
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 60,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        [{ type: QuestionType.Range, value: question.correct }],
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
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 61,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        [{ type: QuestionType.Range, value: question.correct }],
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
        correct: 50,
        margin: QuestionRangeAnswerMargin.Maximum,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 100,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        [{ type: QuestionType.Range, value: question.correct }],
        presented,
        question,
        answer,
      )
      expect(score).toEqual(183)
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
        [{ type: QuestionType.Range, value: question.correct }],
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
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 50,
        created: new Date(presented.getTime() + 30000), // Answered in 30 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeRangeQuestionScore(
        [{ type: QuestionType.Range, value: question.correct }],
        presented,
        question,
        answer,
      )
      expect(score).toEqual(900)
    })
  })

  describe('calculateClassicModePinQuestionScore', () => {
    const presented = new Date()

    it('exact location → full precision (0.8 * points) + speed, rounded', () => {
      const question = createMockPinQuestionDocument({
        positionX: 0.5,
        positionY: 0.5,
        tolerance: QuestionPinTolerance.Medium, // radius = 0.12
        points: 1000,
      })
      const correct = [
        {
          type: QuestionType.Pin,
          value: `${question.positionX},${question.positionY}`,
        },
      ]

      const answer = createMockQuestionTaskPinAnswer({
        answer: `0.5,0.5`,
        created: new Date(presented.getTime() + 5000),
      })

      const score = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        answer,
      )
      expect(score).toBe(900)
    })

    it('within tolerance (half radius) → half precision + speed', () => {
      const question = createMockPinQuestionDocument({
        positionX: 0.5,
        positionY: 0.5,
        tolerance: QuestionPinTolerance.Medium, // radius = 0.12
        points: 1000,
      })
      const correct = [
        {
          type: QuestionType.Pin,
          value: `${question.positionX},${question.positionY}`,
        },
      ]

      const answer = createMockQuestionTaskPinAnswer({
        answer: `0.56,0.5`,
        created: new Date(presented.getTime() + 5000),
      })

      const score = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        answer,
      )
      expect(score).toBe(500)
    })

    it('exactly at tolerance boundary → precision 0 + speed only', () => {
      const question = createMockPinQuestionDocument({
        positionX: 0.5,
        positionY: 0.5,
        tolerance: QuestionPinTolerance.Medium, // radius = 0.12
        points: 1000,
      })
      const correct = [
        {
          type: QuestionType.Pin,
          value: `${question.positionX},${question.positionY}`,
        },
      ]

      const answer = createMockQuestionTaskPinAnswer({
        answer: `0.62,0.5`,
        created: new Date(presented.getTime() + 5000),
      })

      const score = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        answer,
      )
      expect(score).toBe(100)
    })

    it('outside tolerance → total score 0 (even if answer is fast)', () => {
      const question = createMockPinQuestionDocument({
        positionX: 0.5,
        positionY: 0.5,
        tolerance: QuestionPinTolerance.Medium, // radius = 0.12
        points: 1000,
      })
      const correct = [
        {
          type: QuestionType.Pin,
          value: `${question.positionX},${question.positionY}`,
        },
      ]

      // distance = 0.13 (> 0.12) → not correct → score 0
      const answer = createMockQuestionTaskPinAnswer({
        answer: `0.63,0.5`,
        created: new Date(presented.getTime() + 1000),
      })
      const score = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        answer,
      )
      expect(score).toBe(0)
    })

    it('multiple correct points: picks the maximum resulting score (nearest correct point)', () => {
      const question = createMockPinQuestionDocument({
        positionX: 0.5,
        positionY: 0.5,
        tolerance: QuestionPinTolerance.Medium,
        points: 1000,
      })

      // Two valid correct points; answer is closer to the second
      const correct = [
        { type: QuestionType.Pin, value: '0.50,0.50' },
        { type: QuestionType.Pin, value: '0.60,0.50' },
      ]

      const answer = createMockQuestionTaskPinAnswer({
        answer: `0.59,0.5`,
        created: new Date(presented.getTime() + 5000),
      })
      const score = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        answer,
      )
      expect(score).toBe(833)
    })

    it('monotonicity: closer answer yields strictly higher score (same timing)', () => {
      const question = createMockPinQuestionDocument()
      const correct = [
        {
          type: QuestionType.Pin,
          value: `${question.positionX},${question.positionY}`,
        },
      ]

      const farther = createMockQuestionTaskPinAnswer({
        answer: `0.6,0.5`,
        created: new Date(presented.getTime() + 5000),
      })
      const closer = createMockQuestionTaskPinAnswer({
        answer: `0.55,0.5`,
        created: new Date(presented.getTime() + 5000),
      })

      const scoreFar = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        farther,
      )
      const scoreClose = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        closer,
      )
      expect(scoreClose).toBeGreaterThan(scoreFar)
    })

    it('timing matters: same position, slower answer → lower score', () => {
      const question = createMockPinQuestionDocument()
      const correct = [
        {
          type: QuestionType.Pin,
          value: `${question.positionX},${question.positionY}`,
        },
      ]

      const fast = createMockQuestionTaskPinAnswer({
        answer: `0.55,0.5`,
        created: new Date(presented.getTime() + 2000),
      })
      const slow = createMockQuestionTaskPinAnswer({
        answer: `0.55,0.5`,
        created: new Date(presented.getTime() + 15000),
      })

      const fastScore = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        fast,
      )
      const slowScore = calculateClassicModePinQuestionScore(
        correct,
        presented,
        question,
        slow,
      )
      expect(fastScore).toBeGreaterThan(slowScore)
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

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.MultiChoice, index: 0 }],
        answer,
      )
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

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.MultiChoice, index: 0 }],
        answer,
      )
      expect(score).toEqual(0)
    })

    it('should calculate score for a range question', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 50,
        created: new Date(presented.getTime() + 5000), // Answered in 5 seconds
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.Range, value: question.correct }],
        answer,
      )
      expect(score).toEqual(983) // Speed + precision-based calculation
    })

    it('should return 0 for undefined answers', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.TrueFalse,
        correct: true,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionTrueFalseDao

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.TrueFalse, value: true }],
        undefined,
      )
      expect(score).toEqual(0) // No answer provided
    })

    it('should return 0 for a range question with incorrect answer', () => {
      const presented = new Date()

      const question = {
        type: QuestionType.Range,
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        min: 0,
        max: 100,
        step: 2,
        points: 1000,
        duration: 30,
      } as BaseQuestionDao & QuestionRangeDao

      const answer = {
        type: QuestionType.Range,
        answer: 61,
        created: new Date(presented.getTime() + 5000),
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.Range, value: question.correct }],
        answer,
      )
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

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.TrueFalse, value: question.correct }],
        answer,
      )
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

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.TrueFalse, value: question.correct }],
        answer,
      )
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

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.TypeAnswer, value: 'correct answer' }],
        answer,
      )
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

      const score = calculateClassicModeScore(
        presented,
        question,
        [{ type: QuestionType.TypeAnswer, value: 'correct answer' }],
        answer,
      )
      expect(score).toEqual(0)
    })

    it('should calculate score for a pin question and correct answer', () => {
      const presented = new Date()

      const question = createMockPinQuestionDocument()

      const answer = createMockQuestionTaskPinAnswer({
        answer: '0.5,0.5',
        created: new Date(presented.getTime() + 1000), // 1 second
      })

      const score = calculateClassicModeScore(
        presented,
        question,
        [
          {
            type: QuestionType.Pin,
            value: `${question.positionX},${question.positionY}`,
          },
        ],
        answer,
      )
      expect(score).toEqual(980)
    })

    it('should return 0 for a pin question and incorrect answer', () => {
      const presented = new Date()

      const question = createMockPinQuestionDocument()

      const answer = createMockQuestionTaskPinAnswer({
        answer: '0.0,0.0',
        created: new Date(presented.getTime() + 1000), // 1 second
      })

      const score = calculateClassicModeScore(
        presented,
        question,
        [
          {
            type: QuestionType.Pin,
            value: `${question.positionX},${question.positionY}`,
          },
        ],
        answer,
      )
      expect(score).toEqual(0)
    })

    it('should return 0 for a pin question and undefined answers', () => {
      const presented = new Date()

      const question = createMockPinQuestionDocument()

      const score = calculateClassicModeScore(
        presented,
        question,
        [
          {
            type: QuestionType.Pin,
            value: `${question.positionX},${question.positionY}`,
          },
        ],
        undefined,
      )
      expect(score).toEqual(0) // No answer provided
    })

    //PUZZLE
    it('should calculate score for a puzzle question and correct answer', () => {
      const presented = new Date()

      const question = createMockPuzzleQuestionDocument()

      const answer = createMockQuestionTaskPuzzleAnswer({
        answer: question.values,
        created: new Date(presented.getTime() + 1000), // 1 second
      })

      const score = calculateClassicModeScore(
        presented,
        question,
        [
          {
            type: QuestionType.Puzzle,
            value: question.values,
          },
        ],
        answer,
      )
      expect(score).toEqual(983)
    })

    it('should return 0 for a puzzle question and incorrect answer', () => {
      const presented = new Date()

      const question = createMockPuzzleQuestionDocument()

      const answer = createMockQuestionTaskPuzzleAnswer({
        answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
        created: new Date(presented.getTime() + 1000), // 1 second
      })

      const score = calculateClassicModeScore(
        presented,
        question,
        [
          {
            type: QuestionType.Puzzle,
            value: question.values,
          },
        ],
        answer,
      )
      expect(score).toEqual(0)
    })

    it('should return 0 for a puzzle question and undefined answers', () => {
      const presented = new Date()

      const question = createMockPuzzleQuestionDocument()

      const score = calculateClassicModeScore(
        presented,
        question,
        [
          {
            type: QuestionType.Puzzle,
            value: question.values,
          },
        ],
        undefined,
      )
      expect(score).toEqual(0) // No answer provided
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

      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(-10)
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
      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(5)

      answer = {
        type: QuestionType.Range,
        answer: 45,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(5)

      answer = {
        type: QuestionType.Range,
        answer: 0,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(50)

      answer = {
        type: QuestionType.Range,
        answer: 100,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(50)
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
      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(100)

      answer = {
        type: QuestionType.Range,
        answer: 120,
      } as QuestionTaskBaseAnswer & QuestionTaskRangeAnswer
      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: question.correct }],
          question,
          answer,
        ),
      ).toEqual(100)
    })

    it('should return 100 for invalid questions or answers', () => {
      const question = {
        type: QuestionType.MultiChoice, // Invalid type
      } as BaseQuestionDao & QuestionMultiChoiceDao

      const answer = {
        type: QuestionType.MultiChoice,
        answer: 0,
      } as QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer

      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: 0 }],
          question,
          answer,
        ),
      ).toEqual(100)

      expect(
        calculateZeroToOneHundredModeScore(
          [{ type: QuestionType.Range, value: 0 }],
          question,
          undefined,
        ),
      ).toEqual(100)
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
            step: 2,
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
            answer: 39,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_03,
            created: offset(5),
            answer: 61,
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
              answer: 39,
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
              answer: 61,
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

    it('should build a question result task item for a classic mode game when question type is pin', () => {
      const player1Answer = createMockQuestionTaskPinAnswer({
        playerId: PARTICIPANT_PLAYER_ID_01,
        created: offset(3),
        answer: '0.5,0.5',
      })
      const player2Answer = createMockQuestionTaskPinAnswer({
        playerId: PARTICIPANT_PLAYER_ID_02,
        created: offset(4),
        answer: '0.0,0.0',
      })

      const gameDocument = buildGameDocument(
        [createMockPinQuestionDocument()],
        [player1Answer, player2Answer],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.Pin, value: '0.5,0.5' }],
        results: [
          {
            type: QuestionType.Pin,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: '0.5,0.5',
              created: offset(3),
            },
            correct: true,
            lastScore: 980,
            totalScore: 980,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.Pin,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: '0.0,0.0',
              created: offset(4),
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.Pin,
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

    it('should build a question result task item for a classic mode game when question type is puzzle', () => {
      const player1Answer = createMockQuestionTaskPuzzleAnswer({
        playerId: PARTICIPANT_PLAYER_ID_01,
        created: offset(3),
        answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      })
      const player2Answer = createMockQuestionTaskPuzzleAnswer({
        playerId: PARTICIPANT_PLAYER_ID_02,
        created: offset(4),
        answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
      })

      const gameDocument = buildGameDocument(
        [createMockPuzzleQuestionDocument()],
        [player1Answer, player2Answer],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [
          {
            type: QuestionType.Puzzle,
            value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
          },
        ],
        results: [
          {
            type: QuestionType.Puzzle,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
              created: offset(3),
            },
            correct: true,
            lastScore: 983,
            totalScore: 983,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.Puzzle,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
              created: offset(4),
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.Puzzle,
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
        participantId: uuidv4(),
        type: GameParticipantType.HOST,
      },
      {
        participantId: PARTICIPANT_PLAYER_ID_01,
        type: GameParticipantType.PLAYER,
        totalScore: 0,
        currentStreak: 0,
      },
      {
        participantId: PARTICIPANT_PLAYER_ID_02,
        type: GameParticipantType.PLAYER,
        totalScore: 0,
        currentStreak: 0,
      },
      {
        participantId: PARTICIPANT_PLAYER_ID_03,
        type: GameParticipantType.PLAYER,
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
