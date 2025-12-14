import { QuestionType } from '@quiz/common'

import {
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

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

    it('returns 0 when answered timestamp is invalid', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const answer = buildAnswer(['A', 'B', 'C', 'D'], undefined)

      const score = strategy.calculateScore(
        presented,
        undefined,
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

    it('returns 0 when answered after the allowed duration even if all tiles are correct', () => {
      const correctValues = ['A', 'B', 'C', 'D']
      const correct = buildCorrect(correctValues)

      const created = new Date(presented.getTime() + (duration + 1) * 1000) // 1s too late
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

      expect(score).toBe(0)
    })

    it('returns 0 when lengths differ even if some values match', () => {
      const correct = buildCorrect(['A', 'B', 'C', 'D'])
      const created = new Date(presented.getTime() + 1000)

      // same prefix, but too short
      const answer = buildAnswer(['A', 'B', 'C'], created)

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

  describe('countCorrectPuzzlePositions', () => {
    const callToCorrectPuzzlePositions = (
      correct: ClassicCorrect<QuestionType.Puzzle>,
      answer?: ClassicAnswer<QuestionType.Puzzle>,
    ) => (strategy as any).countCorrectPuzzlePositions(correct, answer)

    const buildCorrect = (
      value: unknown[] | undefined,
    ): ClassicCorrect<QuestionType.Puzzle> =>
      ({ value }) as ClassicCorrect<QuestionType.Puzzle>

    const buildAnswer = (
      value: unknown[] | undefined,
    ): ClassicAnswer<QuestionType.Puzzle> =>
      ({ answer: value }) as ClassicAnswer<QuestionType.Puzzle>

    it('returns 0 when correct value is undefined', () => {
      const correct = buildCorrect(undefined)
      const answer = buildAnswer([1, 2, 3])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(0)
    })

    it('returns 0 when answer is undefined', () => {
      const correct = buildCorrect([1, 2, 3])

      expect(callToCorrectPuzzlePositions(correct, undefined)).toBe(0)
    })

    it('returns 0 when correct value is not an array', () => {
      const correct = {
        value: 'not-an-array',
      } as unknown as ClassicCorrect<QuestionType.Puzzle>
      const answer = buildAnswer([1, 2, 3])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(0)
    })

    it('returns 0 when answer value is not an array', () => {
      const correct = buildCorrect([1, 2, 3])
      const answer = {
        answer: 'not-an-array',
      } as unknown as ClassicAnswer<QuestionType.Puzzle>

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(0)
    })

    it('returns 0 when array lengths differ', () => {
      const correct = buildCorrect([1, 2, 3, 4])
      const answerShort = buildAnswer([1, 2, 3])
      const answerLong = buildAnswer([1, 2, 3, 4, 5])

      expect(callToCorrectPuzzlePositions(correct, answerShort)).toBe(0)
      expect(callToCorrectPuzzlePositions(correct, answerLong)).toBe(0)
    })

    it('returns 0 when no positions match', () => {
      const correct = buildCorrect([1, 2, 3, 4])
      const answer = buildAnswer([5, 6, 7, 8])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(0)
    })

    it('counts positions that match exactly', () => {
      const correct = buildCorrect([1, 2, 3, 4])
      const answer = buildAnswer([1, 99, 3, 0])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(2)
    })

    it('returns full length when all positions match', () => {
      const correct = buildCorrect(['a', 'b', 'c'])
      const answer = buildAnswer(['a', 'b', 'c'])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(3)
    })

    it('is order-sensitive and only counts matches at the same index', () => {
      const correct = buildCorrect([1, 2, 3])
      const answer = buildAnswer([2, 1, 3])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(1)
    })

    it('uses strict equality when comparing values', () => {
      const correct = buildCorrect(['1', '2'])
      const answer = buildAnswer([1, 2])

      expect(callToCorrectPuzzlePositions(correct, answer)).toBe(0)
    })
  })

  describe('hasAnyCorrectPuzzlePosition', () => {
    const callToHasAnyCorrectPuzzlePosition = (
      correct: ClassicCorrect<QuestionType.Puzzle>,
      answer?: ClassicAnswer<QuestionType.Puzzle>,
    ) => (strategy as any).hasAnyCorrectPuzzlePosition(correct, answer)

    const buildCorrect = (
      value: unknown[] | undefined,
    ): ClassicCorrect<QuestionType.Puzzle> =>
      ({ value }) as ClassicCorrect<QuestionType.Puzzle>

    const buildAnswer = (
      value: unknown[] | undefined,
    ): ClassicAnswer<QuestionType.Puzzle> =>
      ({ answer: value }) as ClassicAnswer<QuestionType.Puzzle>

    it('returns false when answer is undefined', () => {
      const correct = buildCorrect([1, 2, 3])

      expect(callToHasAnyCorrectPuzzlePosition(correct, undefined)).toBe(false)
    })

    it('returns false when there are no correct positions', () => {
      const correct = buildCorrect([1, 2, 3, 4])
      const answer = buildAnswer([5, 6, 7, 8])

      expect(callToHasAnyCorrectPuzzlePosition(correct, answer)).toBe(false)
    })

    it('returns false when arrays are not the same length', () => {
      const correct = buildCorrect([1, 2, 3, 4])
      const answer = buildAnswer([1, 2, 3])

      expect(callToHasAnyCorrectPuzzlePosition(correct, answer)).toBe(false)
    })

    it('returns true when exactly one position is correct', () => {
      const correct = buildCorrect([1, 2, 3, 4])
      const answer = buildAnswer([9, 2, 8, 7])

      expect(callToHasAnyCorrectPuzzlePosition(correct, answer)).toBe(true)
    })

    it('returns true when multiple positions are correct', () => {
      const correct = buildCorrect(['a', 'b', 'c', 'd'])
      const answer = buildAnswer(['a', 'x', 'c', 'y'])

      expect(callToHasAnyCorrectPuzzlePosition(correct, answer)).toBe(true)
    })

    it('returns true when all positions are correct', () => {
      const correct = buildCorrect([1, 2, 3])
      const answer = buildAnswer([1, 2, 3])

      expect(callToHasAnyCorrectPuzzlePosition(correct, answer)).toBe(true)
    })
  })
})
