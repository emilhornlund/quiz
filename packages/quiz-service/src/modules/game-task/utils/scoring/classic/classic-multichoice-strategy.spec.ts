import { QuestionType } from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

import { ClassicMultiChoiceScoringStrategy } from './classic-multichoice-strategy'

describe('ClassicMultiChoiceScoringStrategy', () => {
  const strategy = new ClassicMultiChoiceScoringStrategy()

  const meta = {} as ClassicMeta<QuestionType.MultiChoice>

  const correct = {
    index: 2,
  } as unknown as ClassicCorrect<QuestionType.MultiChoice>

  const buildAnswer = (
    index: number,
  ): ClassicAnswer<QuestionType.MultiChoice> =>
    ({
      answer: index,
    }) as unknown as ClassicAnswer<QuestionType.MultiChoice>

  describe('isCorrect', () => {
    it('isCorrect returns true when selected index matches correct index', () => {
      const answer = buildAnswer(2)

      const result = strategy.isCorrect(correct, answer, meta)

      expect(result).toBe(true)
    })

    it('isCorrect returns false when selected index does not match correct index', () => {
      const answer = buildAnswer(1)

      const result = strategy.isCorrect(correct, answer, meta)

      expect(result).toBe(false)
    })

    it('isCorrect returns false when answer is undefined', () => {
      const result = strategy.isCorrect(correct, undefined, meta)

      expect(result).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('calculateScore returns 0 when answer is incorrect', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime() + 5_000)
      const duration = 10
      const points = 1000
      const answer = buildAnswer(1)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('calculateScore returns full points when correct answer is submitted immediately', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime())
      const duration = 10
      const points = 1000
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(1000)
    })

    it('calculateScore applies linear decay down to 50% at the deadline (middle of duration)', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + (duration * 1000) / 2) // at half duration
      const points = 1000
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(750)
    })

    it('calculateScore returns 50% of points when answered exactly at the deadline', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + duration * 1000)
      const points = 1000
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(500)
    })

    it('calculateScore returns 0 when answer is undefined', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime() + 5_000)

      const score = strategy.calculateScore(
        presented,
        answered,
        10,
        100,
        correct,
        undefined,
        meta,
      )

      expect(score).toBe(0)
    })

    it('calculateScore returns 0 when answered after the deadline even if correct', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const duration = 10
      const answered = new Date(presented.getTime() + duration * 1000 + 1_000)
      const points = 1000
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('calculateScore returns 0 when duration is non-positive even if answer is correct', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime())
      const duration = 0
      const points = 1000
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('calculateScore returns 0 when points is negative', () => {
      const presented = new Date('2024-01-01T00:00:00.000Z')
      const answered = new Date(presented.getTime())
      const duration = 10
      const points = -10
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })

    it('calculateScore returns 0 when answered before presented', () => {
      const answered = new Date('2024-01-01T00:00:00.000Z')
      const presented = new Date(answered.getTime() + 5_000)
      const duration = 10
      const points = 1000
      const answer = buildAnswer(2)

      const score = strategy.calculateScore(
        presented,
        answered,
        duration,
        points,
        correct,
        answer,
        meta,
      )

      expect(score).toBe(0)
    })
  })
})
