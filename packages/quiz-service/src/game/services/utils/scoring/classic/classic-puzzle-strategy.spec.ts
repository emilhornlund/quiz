import { QuestionType } from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-strategy'

import { ClassicPuzzleScoringStrategy } from './classic-puzzle-strategy'

describe('ClassicPuzzleScoringStrategy', () => {
  const strategy = new ClassicPuzzleScoringStrategy()

  const buildCorrect = (value: string[]): ClassicCorrect<QuestionType.Puzzle> =>
    ({
      value,
    }) as unknown as ClassicCorrect<QuestionType.Puzzle>

  const buildAnswer = (
    answer: string[],
    created?: Date,
  ): ClassicAnswer<QuestionType.Puzzle> =>
    ({
      answer,
      created,
    }) as unknown as ClassicAnswer<QuestionType.Puzzle>

  const buildMeta = (): ClassicMeta<QuestionType.Puzzle> =>
    ({}) as ClassicMeta<QuestionType.Puzzle>

  describe('isCorrect', () => {
    it('returns true when order matches exactly', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const answer = buildAnswer(['A', 'B', 'C', 'D'])

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(true)
    })

    it('returns true when at least one position is correct', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const answer = buildAnswer(['X', 'B', 'Y', 'Z'])

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(true)
    })

    it('returns false when no positions are correct', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const answer = buildAnswer(['X', 'Y', 'Z', 'W'])

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(false)
    })

    it('returns false when answer is undefined', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])

      const result = strategy.isCorrect(correct, undefined, buildMeta())

      expect(result).toBe(false)
    })

    it('returns false when lengths differ (missing or extra values)', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const missingOne = buildAnswer(['A', 'B', 'C'])
      const extraOne = buildAnswer(['A', 'B', 'C', 'D', 'E'])

      expect(strategy.isCorrect(correct, missingOne, buildMeta())).toBe(false)
      expect(strategy.isCorrect(correct, extraOne, buildMeta())).toBe(false)
    })

    it('is case-sensitive (values with different casing are not equal)', () => {
      const correct = buildCorrect(['Athens', 'Argos', 'Plovdiv', 'Lisbon'])
      const answer = buildAnswer(['athens', 'argos', 'plovdiv', 'lisbon'])

      const result = strategy.isCorrect(correct, answer, buildMeta())

      expect(result).toBe(false)
    })

    it('returns false when correct.value is empty or missing', () => {
      const correctEmpty = buildCorrect([])
      const correctMissing = {
        value: undefined,
      } as unknown as ClassicCorrect<QuestionType.Puzzle>
      const answer = buildAnswer(['A'])

      expect(strategy.isCorrect(correctEmpty, answer, buildMeta())).toBe(false)
      expect(strategy.isCorrect(correctMissing, answer, buildMeta())).toBe(
        false,
      )
    })
  })

  describe('calculateScore', () => {
    const duration = 30
    const points = 1000
    const presented = new Date('2024-01-01T12:00:00.000Z')

    it('calculates score for fully correct answer (all tiles correct)', () => {
      const correctValues = ['A', 'B', 'C', 'D']
      const correct = buildCorrect(correctValues)
      const created = new Date(presented.getTime() + 1000)
      const answer = buildAnswer([...correctValues], created)

      const score = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      // 1s of 30s with full correctness → ~983 based on Classic base scoring
      expect(score).toBe(983)
    })

    it('returns 0 when answer is undefined', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const created = new Date(presented.getTime() + 1000)

      const score = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        undefined,
        buildMeta(),
      )

      expect(score).toBe(0)
    })

    it('returns 0 when answer.created is missing', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const answer = buildAnswer(['A', 'B', 'C', 'D'], undefined)

      const score = strategy.calculateScore(
        presented,
        presented,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(0)
    })

    it('returns 0 when no tiles are correct', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const created = new Date(presented.getTime() + 1000)
      const answer = buildAnswer(['W', 'X', 'Y', 'Z'], created)

      const score = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(0)
    })

    it('returns 0 when correct.value is empty', () => {
      const correct = buildCorrect([])
      const created = new Date(presented.getTime() + 1000)
      const answer = buildAnswer([], created)

      const score = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        answer,
        buildMeta(),
      )

      expect(score).toBe(0)
    })

    it('applies partial credit proportional to fraction of correct tiles', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const created = new Date(presented.getTime() + 1000)

      const halfCorrect = buildAnswer(['A', 'X', 'C', 'Y'], created) // 2/4 correct
      const quarterCorrect = buildAnswer(['A', 'X', 'Y', 'Z'], created) // 1/4 correct

      const fullCorrect = buildAnswer(['A', 'B', 'C', 'D'], created)

      const fullScore = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        fullCorrect,
        buildMeta(),
      )
      const halfScore = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        halfCorrect,
        buildMeta(),
      )
      const quarterScore = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        quarterCorrect,
        buildMeta(),
      )

      expect(fullScore).toBe(983)
      expect(halfScore).toBe(Math.round(fullScore * 0.5))
      expect(quarterScore).toBe(Math.round(fullScore * 0.25))

      expect(fullScore).toBeGreaterThan(halfScore)
      expect(halfScore).toBeGreaterThan(quarterScore)
      expect(quarterScore).toBeGreaterThan(0)
    })

    it('monotonicity: more correct tiles with same timing yields higher score', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const created = new Date(presented.getTime() + 5000)

      const oneCorrect = buildAnswer(['A', 'X', 'Y', 'Z'], created)
      const twoCorrect = buildAnswer(['A', 'B', 'Y', 'Z'], created)
      const threeCorrect = buildAnswer(['A', 'B', 'C', 'Z'], created)

      const score1 = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        oneCorrect,
        buildMeta(),
      )
      const score2 = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        twoCorrect,
        buildMeta(),
      )
      const score3 = strategy.calculateScore(
        presented,
        created,
        duration,
        points,
        correct,
        threeCorrect,
        buildMeta(),
      )

      expect(score3).toBeGreaterThan(score2)
      expect(score2).toBeGreaterThan(score1)
    })

    it('timing matters: same fraction of correct tiles, slower answer yields lower score', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])

      const fastCreated = new Date(presented.getTime() + 2000)
      const slowCreated = new Date(presented.getTime() + 15000)

      const arrangement = ['A', 'B', 'X', 'Y'] // 2/4 correct

      const fastAnswer = buildAnswer(arrangement, fastCreated)
      const slowAnswer = buildAnswer(arrangement, slowCreated)

      const fastScore = strategy.calculateScore(
        presented,
        fastCreated,
        duration,
        points,
        correct,
        fastAnswer,
        buildMeta(),
      )
      const slowScore = strategy.calculateScore(
        presented,
        slowCreated,
        duration,
        points,
        correct,
        slowAnswer,
        buildMeta(),
      )

      expect(fastScore).toBeGreaterThan(slowScore)
    })
  })
})
