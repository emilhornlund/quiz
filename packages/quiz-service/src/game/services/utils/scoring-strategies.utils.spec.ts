import {
  QuestionType,
  QUIZ_PUZZLE_VALUES_MAX,
  QUIZ_PUZZLE_VALUES_MIN,
} from '@quiz/common'

import {
  QuestionResultTaskBaseCorrectAnswer,
  QuestionResultTaskCorrectPuzzleAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskPuzzleAnswer,
} from '../../repositories/models/schemas'

import {
  calculateClassicModeRawScore,
  calculatePuzzleScore,
  isPuzzleQuestionAnswerCorrect,
} from './scoring-strategies.utils'

// Helpers
const presented = new Date('2025-01-01T00:00:00.000Z')
const at = (seconds: number) => new Date(presented.getTime() + seconds * 1000)

function buildCorrect(
  values: string[],
): QuestionResultTaskBaseCorrectAnswer & QuestionResultTaskCorrectPuzzleAnswer {
  return {
    type: QuestionType.Puzzle,
    value: values,
  }
}

function buildAnswer(
  values: string[],
  created?: Date,
): QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer {
  return {
    type: QuestionType.Puzzle,
    playerId: '00000000-0000-0000-0000-000000000000',
    created,
    answer: values,
  }
}

describe('calculateClassicModeRawScore', () => {
  it('returns full points when answered instantly', () => {
    const points = 100
    const duration = 30
    const score = calculateClassicModeRawScore(
      presented,
      at(0),
      duration,
      points,
    )
    expect(score).toBe(100)
  })

  it('returns 75% at halfway through duration (linear decay to 50% at deadline)', () => {
    const points = 80
    const duration = 20
    const halfway = duration / 2 // 10s
    // ratio = 0.5 → multiplier = 1 - 0.5/2 = 0.75 → 80 * 0.75 = 60
    const score = calculateClassicModeRawScore(
      presented,
      at(halfway),
      duration,
      points,
    )
    expect(score).toBeCloseTo(60, 6)
  })

  it('returns 50% at exactly the deadline', () => {
    const points = 40
    const duration = 16
    // ratio = 1 → multiplier = 0.5 → 40 * 0.5 = 20
    const score = calculateClassicModeRawScore(
      presented,
      at(duration),
      duration,
      points,
    )
    expect(score).toBe(20)
  })

  it('returns 0 when answered after the deadline', () => {
    const score = calculateClassicModeRawScore(presented, at(31), 30, 100)
    expect(score).toBe(0)
  })

  it('returns 0 when answered before it was presented', () => {
    const score = calculateClassicModeRawScore(presented, at(-1), 30, 100)
    expect(score).toBe(0)
  })

  it('returns 0 for invalid/edge inputs (non-finite or non-positive duration/points)', () => {
    const answered = at(1)
    expect(calculateClassicModeRawScore(presented, answered, 0, 100)).toBe(0)
    expect(calculateClassicModeRawScore(presented, answered, -5, 100)).toBe(0)
    expect(calculateClassicModeRawScore(presented, answered, 30, 0)).toBe(0)
    expect(calculateClassicModeRawScore(presented, answered, 30, -1)).toBe(0)
    expect(
      calculateClassicModeRawScore(presented, answered, Number.NaN, 100),
    ).toBe(0)
    expect(
      calculateClassicModeRawScore(presented, answered, 30, Number.NaN),
    ).toBe(0)
  })

  it('returns 0 when dates are invalid', () => {
    const badDate = new Date('invalid')
    const good = at(1)
    expect(calculateClassicModeRawScore(badDate, good, 30, 100)).toBe(0)
    expect(calculateClassicModeRawScore(presented, badDate, 30, 100)).toBe(0)
  })

  it('handles fractional results (no rounding here)', () => {
    // duration=10, answered at 3s → ratio=0.3 → multiplier=1 - 0.15 = 0.85
    const score = calculateClassicModeRawScore(presented, at(3), 10, 95)
    expect(score).toBeCloseTo(80.75, 6)
  })
})

describe('isPuzzleQuestionAnswerCorrect', () => {
  it('returns true when at least one position matches and lengths are equal', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['X', 'B', 'Y'], at(3))
    expect(isPuzzleQuestionAnswerCorrect(correct, answer)).toBe(true)
  })

  it('returns false when no positions match (same length)', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['X', 'Y', 'Z'], at(3))
    expect(isPuzzleQuestionAnswerCorrect(correct, answer)).toBe(false)
  })

  it('returns false when lengths differ', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'C', 'D'], at(2))
    expect(isPuzzleQuestionAnswerCorrect(correct, answer)).toBe(false)
  })

  it('returns false when answer is missing/undefined', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    expect(isPuzzleQuestionAnswerCorrect(correct, undefined)).toBe(false)
  })

  it('works for max length (6) with at least one match', () => {
    const correct = buildCorrect(['A', 'B', 'C', 'D', 'E', 'F'])
    const answer = buildAnswer(['A', 'X', 'Y', 'Z', 'C', 'D'], at(1))
    expect(isPuzzleQuestionAnswerCorrect(correct, answer)).toBe(true)
  })

  it('works for min length (3) with no matches', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['X', 'Y', 'Z'], at(1))
    expect(isPuzzleQuestionAnswerCorrect(correct, answer)).toBe(false)
  })

  it(`supports max length (${QUIZ_PUZZLE_VALUES_MAX})`, () => {
    const maxVals = Array.from({ length: QUIZ_PUZZLE_VALUES_MAX }, (_, i) =>
      String.fromCharCode(65 + i),
    )
    const correct = buildCorrect(maxVals)
    const answer = buildAnswer(
      [maxVals[0], ...maxVals.slice(1).reverse()],
      at(2),
    )
    expect(isPuzzleQuestionAnswerCorrect(correct, answer)).toBe(true)
  })
})

describe('calculatePuzzleScore', () => {
  it('full points when fully correct and answered instantly (fraction=1, multiplier=1)', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'C'], at(0))
    const points = 100
    const duration = 30
    const score = calculatePuzzleScore(
      presented,
      duration,
      points,
      correct,
      answer,
    )
    expect(score).toBe(100)
  })

  it('half points when fully correct and answered exactly at the deadline', () => {
    const correct = buildCorrect(['A', 'B', 'C', 'D'])
    const duration = 20
    const points = 100
    const answer = buildAnswer(['A', 'B', 'C', 'D'], at(duration))
    const score = calculatePuzzleScore(
      presented,
      duration,
      points,
      correct,
      answer,
    )
    // base multiplier at deadline = 0.5, fraction = 1.0 => total = 50
    expect(score).toBe(50)
  })

  it('zero when answered after the deadline', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const duration = 10
    const points = 100
    const answer = buildAnswer(['A', 'B', 'C'], at(duration + 1))
    const score = calculatePuzzleScore(
      presented,
      duration,
      points,
      correct,
      answer,
    )
    expect(score).toBe(0)
  })

  it('zero when no positions are correct (even if on time)', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['X', 'Y', 'Z'], at(5))
    const score = calculatePuzzleScore(presented, 30, 100, correct, answer)
    expect(score).toBe(0)
  })

  it('partial credit: 2/4 correct, answered halfway through time (ratio=0.5 → multiplier=0.75)', () => {
    const correct = buildCorrect(['A', 'B', 'C', 'D'])
    const answer = buildAnswer(['A', 'X', 'C', 'Y'], at(10)) // 2 correct positions (A, C)
    const duration = 20
    const points = 80

    // base = points * 0.75 = 60
    // fraction (2/4) = 0.5
    // total = 60 * 0.5 = 30 → rounded 30
    const score = calculatePuzzleScore(
      presented,
      duration,
      points,
      correct,
      answer,
    )
    expect(score).toBe(30)
  })

  it('rounds the final score to nearest integer', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'X'], at(3)) // 2/3 correct
    const duration = 10
    const points = 95

    // multiplier at 3/10 = 1 - 0.3/2 = 0.85
    // base = 95 * 0.85 = 80.75
    // fraction = 2/3 ≈ 0.666666..., total ≈ 53.833... → rounds to 54
    const score = calculatePuzzleScore(
      presented,
      duration,
      points,
      correct,
      answer,
    )
    expect(score).toBe(54)
  })

  it('zero if `created` is missing on the answer', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'C'], undefined)
    const score = calculatePuzzleScore(presented, 30, 100, correct, answer)
    expect(score).toBe(0)
  })

  it('zero if duration <= 0', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'C'], at(1))
    expect(calculatePuzzleScore(presented, 0, 100, correct, answer)).toBe(0)
    expect(calculatePuzzleScore(presented, -5, 100, correct, answer)).toBe(0)
  })

  it('zero if points <= 0', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'C'], at(1))
    expect(calculatePuzzleScore(presented, 30, 0, correct, answer)).toBe(0)
    expect(calculatePuzzleScore(presented, 30, -10, correct, answer)).toBe(0)
  })

  it('zero if lengths differ (e.g., min vs max)', () => {
    const minVals = Array.from({ length: QUIZ_PUZZLE_VALUES_MIN }, (_, i) =>
      String.fromCharCode(65 + i),
    ) // ['A','B','C']
    const maxVals = Array.from({ length: QUIZ_PUZZLE_VALUES_MAX }, (_, i) =>
      String.fromCharCode(65 + i),
    ) // ['A','B','C','D']

    const correctMin = buildCorrect(minVals)
    const answerMax = buildAnswer(maxVals, at(2))
    const score1 = calculatePuzzleScore(
      presented,
      30,
      100,
      correctMin,
      answerMax,
    )
    expect(score1).toBe(0)

    const correctMax = buildCorrect(maxVals)
    const answerMin = buildAnswer(minVals, at(2))
    const score2 = calculatePuzzleScore(
      presented,
      30,
      100,
      correctMax,
      answerMin,
    )
    expect(score2).toBe(0)
  })

  it('zero if presented/created dates are invalid', () => {
    const correct = buildCorrect(['A', 'B', 'C'])
    const answer = buildAnswer(['A', 'B', 'C'], new Date('invalid'))
    const score = calculatePuzzleScore(
      new Date('invalid'),
      30,
      100,
      correct,
      answer,
    )
    expect(score).toBe(0)
  })

  it(`partial credit scales with max length (${QUIZ_PUZZLE_VALUES_MAX})`, () => {
    const maxVals = Array.from({ length: QUIZ_PUZZLE_VALUES_MAX }, (_, i) =>
      String.fromCharCode(65 + i),
    ) // e.g. ['A','B','C','D','E','F'] when MAX=6
    const correct = buildCorrect(maxVals)

    // Make exactly 3 positions match (keep indices 0,2,5 matching; derange 1,3,4)
    const answerVals = [...maxVals]
    answerVals[1] = maxVals[3] // D into pos 1 (wrong)
    answerVals[3] = maxVals[4] // E into pos 3 (wrong)
    answerVals[4] = maxVals[1] // B into pos 4 (wrong)
    // Result for 6: ['A','D','C','E','B','F'] → matches at 0,2,5 (3/6)

    const answer = buildAnswer(answerVals, at(10)) // halfway of duration=20
    const duration = 20
    const points = 120

    // ratio = 10/20 = 0.5 → multiplier = 1 - 0.5/2 = 0.75 → base = 90
    // fraction = 3/6 = 0.5 → 90 * 0.5 = 45
    const score = calculatePuzzleScore(
      presented,
      duration,
      points,
      correct,
      answer,
    )
    expect(score).toBe(45)
  })
})
