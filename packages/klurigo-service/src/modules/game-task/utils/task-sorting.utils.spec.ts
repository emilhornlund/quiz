import { QuestionType } from '@klurigo/common'
import { v4 as uuidv4 } from 'uuid'

import { QuestionResultTaskItem } from '../../game-core/repositories/models/schemas'

import {
  compareSortClassicModeQuestionResultTaskItemByScore,
  compareZeroToOneHundredModeQuestionResultTaskItemByScore,
} from './task-sorting.utils'

describe('Task Sorting Utils', () => {
  describe('compareSortClassicModeQuestionResultTaskItemByScore', () => {
    it('returns 0 when both items have the same totalScore', () => {
      const lhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 100,
      }
      const rhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 100,
      }

      const result = compareSortClassicModeQuestionResultTaskItemByScore(
        lhs,
        rhs,
      )

      expect(result).toBe(0)
    })

    it('returns a negative value when lhs has a higher totalScore than rhs (descending order)', () => {
      const lhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 200,
      }
      const rhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 100,
      }

      const result = compareSortClassicModeQuestionResultTaskItemByScore(
        lhs,
        rhs,
      )

      expect(result).toBeLessThan(0)
    })

    it('returns a positive value when lhs has a lower totalScore than rhs (descending order)', () => {
      const lhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 50,
      }
      const rhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 100,
      }

      const result = compareSortClassicModeQuestionResultTaskItemByScore(
        lhs,
        rhs,
      )

      expect(result).toBeGreaterThan(0)
    })

    it('sorts QuestionResultTaskItem instances in descending order of totalScore', () => {
      const items: QuestionResultTaskItem[] = [
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p1', totalScore: 50 },
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p2', totalScore: 150 },
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p3', totalScore: 150 },
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p4', totalScore: 0 },
      ]

      const sorted = [...items].sort(
        compareSortClassicModeQuestionResultTaskItemByScore,
      )

      const scores = sorted.map((i) => i.totalScore)
      expect(scores).toEqual([150, 150, 50, 0])
    })
  })

  describe('compareZeroToOneHundredModeQuestionResultTaskItemByScore', () => {
    it('returns 0 when both items have the same totalScore', () => {
      const lhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 42,
      }
      const rhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 42,
      }

      const result = compareZeroToOneHundredModeQuestionResultTaskItemByScore(
        lhs,
        rhs,
      )

      expect(result).toBe(0)
    })

    it('returns a positive value when lhs has a higher totalScore than rhs (ascending order)', () => {
      const lhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 200,
      }
      const rhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 100,
      }

      const result = compareZeroToOneHundredModeQuestionResultTaskItemByScore(
        lhs,
        rhs,
      )

      expect(result).toBeGreaterThan(0)
    })

    it('returns a negative value when lhs has a lower totalScore than rhs (ascending order)', () => {
      const lhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 50,
      }
      const rhs: QuestionResultTaskItem = {
        ...MOCK_QUESTION_RESULT_ITEM,
        totalScore: 100,
      }

      const result = compareZeroToOneHundredModeQuestionResultTaskItemByScore(
        lhs,
        rhs,
      )

      expect(result).toBeLessThan(0)
    })

    it('sorts QuestionResultTaskItem instances in ascending order of totalScore', () => {
      const items: QuestionResultTaskItem[] = [
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p1', totalScore: 50 },
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p2', totalScore: 150 },
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p3', totalScore: 150 },
        { ...MOCK_QUESTION_RESULT_ITEM, playerId: 'p4', totalScore: 0 },
      ]

      const sorted = [...items].sort(
        compareZeroToOneHundredModeQuestionResultTaskItemByScore,
      )

      const scores = sorted.map((i) => i.totalScore)
      expect(scores).toEqual([0, 50, 150, 150])
    })
  })
})

const MOCK_QUESTION_RESULT_ITEM: QuestionResultTaskItem = {
  type: QuestionType.Range,
  playerId: uuidv4(),
  nickname: '',
  answer: {
    type: QuestionType.Range,
    playerId: uuidv4(),
    answer: 0,
    created: new Date(),
  },
  correct: true,
  lastScore: 0,
  totalScore: 0,
  position: 0,
  streak: 0,
  responseTime: 0,
}
