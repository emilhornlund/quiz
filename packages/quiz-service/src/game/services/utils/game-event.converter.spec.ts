import {
  GameEventQuestionResults,
  GameEventQuestionResultsMultiChoice,
  GameEventQuestionResultsRange,
  GameEventQuestionResultsTrueFalse,
  GameEventQuestionResultsTypeAnswer,
  GameEventType,
  GameLeaderboardHostEvent,
  GamePodiumHostEvent,
  GameResultHostEvent,
  QuestionType,
} from '@quiz/common'

import {
  createMockGameDocument,
  createMockLeaderboardTaskDocument,
  createMockLeaderboardTaskItem,
  createMockMultiChoiceQuestionDocument,
  createMockPodiumTaskDocument,
  createMockQuestionResultTaskDocument,
  createMockQuestionResultTaskItemDocument,
  createMockQuestionTaskMultiChoiceAnswer,
  createMockQuestionTaskRangeAnswer,
  createMockQuestionTaskTrueFalseAnswer,
  createMockQuestionTaskTypeAnswer,
  createMockRangeQuestionDocument,
  createMockTrueFalseQuestionDocument,
  createMockTypeAnswerQuestionDocument,
  MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
  MOCK_TYPE_ANSWER_OPTION_VALUE,
  MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
} from '../../../../test-utils/data'
import { generateNickname } from '../../../player/services/utils'
import { Game, GameDocument, LeaderboardTaskItem } from '../models/schemas'

import { buildHostGameEvent } from './game-event.converter'

describe('Game Event Converter', () => {
  describe('buildHostGameEvent', () => {
    describe('aggregates MultiChoice distribution when current task is QuestionResult', () => {
      it('should handle mixed correct and incorrect answers', () => {
        const gameDocument = createMultiChoiceGame([0, 1, 0], [0])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'Stockholm', count: 2, correct: true, index: 0 },
          { value: 'Paris', count: 1, correct: false, index: 1 },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle multiple correct answers', () => {
        const gameDocument = createMultiChoiceGame([0, 2, 2, 1], [0, 2])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'London', count: 2, correct: true, index: 2 },
          { value: 'Stockholm', count: 1, correct: true, index: 0 },
          { value: 'Paris', count: 1, correct: false, index: 1 },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being correct', () => {
        const gameDocument = createMultiChoiceGame([0, 0, 0], [0])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'Stockholm', count: 3, correct: true, index: 0 },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being incorrect', () => {
        const gameDocument = createMultiChoiceGame([1, 1, 2], [0])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'Stockholm', count: 0, correct: true, index: 0 },
          { value: 'Paris', count: 2, correct: false, index: 1 },
          { value: 'London', count: 1, correct: false, index: 2 },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle no submitted answers', () => {
        const gameDocument = createMultiChoiceGame([], [0])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'Stockholm', count: 0, correct: true, index: 0 },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle no correct answers', () => {
        const gameDocument = createMultiChoiceGame([0, 1, 2, 3], [])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'Stockholm', count: 1, correct: false, index: 0 },
          { value: 'Paris', count: 1, correct: false, index: 1 },
          { value: 'London', count: 1, correct: false, index: 2 },
          { value: 'Berlin', count: 1, correct: false, index: 3 },
        ])

        expect(actual).toEqual(expected)
      })

      it('should ignore out-of-bounds indexes', () => {
        const gameDocument = createMultiChoiceGame([0, 5, 1], [0])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedMultiChoiceDistribution(gameDocument, [
          { value: 'Stockholm', count: 1, correct: true, index: 0 },
          { value: 'Paris', count: 1, correct: false, index: 1 },
        ])

        expect(actual).toEqual(expected)
      })
    })

    describe('aggregates Range distribution when current task is QuestionResult', () => {
      it('should handle mixed correct and incorrect answers', () => {
        const gameDocument = createRangeGame([50, 40, 50], [50])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 50, count: 2, correct: true },
          { value: 40, count: 1, correct: false },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle multiple correct answers', () => {
        const gameDocument = createRangeGame([40, 50, 50, 60], [50, 60])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 50, count: 2, correct: true },
          { value: 60, count: 1, correct: true },
          { value: 40, count: 1, correct: false },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being correct', () => {
        const gameDocument = createRangeGame([50, 50, 50], [50])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 50, count: 3, correct: true },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being incorrect', () => {
        const gameDocument = createRangeGame([40, 40, 60], [50])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 50, count: 0, correct: true },
          { value: 40, count: 2, correct: false },
          { value: 60, count: 1, correct: false },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle no submitted answers', () => {
        const gameDocument = createRangeGame([], [50])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 50, count: 0, correct: true },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle no correct answers', () => {
        const gameDocument = createRangeGame([40, 50, 60], [])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 40, count: 1, correct: false },
          { value: 50, count: 1, correct: false },
          { value: 60, count: 1, correct: false },
        ])

        expect(actual).toEqual(expected)
      })

      it('should ignore out-of-bounds answers', () => {
        const gameDocument = createRangeGame([-1, 101], [50])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedRangeDistribution(gameDocument, [
          { value: 50, count: 0, correct: true },
        ])

        expect(actual).toEqual(expected)
      })
    })

    describe('aggregates True/False distribution when current task is QuestionResult', () => {
      it('should handle mixed correct and incorrect answers', () => {
        const gameDocument = createTrueFalseGame([false, true, false], [false])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTrueFalseDistribution(gameDocument, [
          { value: false, count: 2, correct: true },
          { value: true, count: 1, correct: false },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle multiple correct answers', () => {
        const gameDocument = createTrueFalseGame(
          [false, false, true],
          [false, true],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTrueFalseDistribution(gameDocument, [
          { value: false, count: 2, correct: true },
          { value: true, count: 1, correct: true },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being correct', () => {
        const gameDocument = createTrueFalseGame([false, false], [false])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTrueFalseDistribution(gameDocument, [
          { value: false, count: 2, correct: true },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being incorrect', () => {
        const gameDocument = createTrueFalseGame([true, true], [false])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTrueFalseDistribution(gameDocument, [
          { value: false, count: 0, correct: true },
          { value: true, count: 2, correct: false },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle no submitted answers', () => {
        const gameDocument = createTrueFalseGame([], [false])

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTrueFalseDistribution(gameDocument, [
          { value: false, count: 0, correct: true },
        ])

        expect(actual).toEqual(expected)
      })
    })

    describe('aggregates Type Answer distribution when current task is QuestionResult', () => {
      it('should handle mixed correct and incorrect answers', () => {
        const gameDocument = createTypeAnswerGame(
          [
            MOCK_TYPE_ANSWER_OPTION_VALUE,
            MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            MOCK_TYPE_ANSWER_OPTION_VALUE.toUpperCase(),
          ],
          [MOCK_TYPE_ANSWER_OPTION_VALUE],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTypeAnswerDistribution(gameDocument, [
          { value: MOCK_TYPE_ANSWER_OPTION_VALUE, count: 2, correct: true },
          {
            value: MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            count: 1,
            correct: false,
          },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle multiple correct answers', () => {
        const gameDocument = createTypeAnswerGame(
          [
            MOCK_TYPE_ANSWER_OPTION_VALUE,
            MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
            MOCK_TYPE_ANSWER_OPTION_VALUE.toUpperCase(),
          ],
          [
            MOCK_TYPE_ANSWER_OPTION_VALUE,
            MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
          ],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTypeAnswerDistribution(gameDocument, [
          { value: MOCK_TYPE_ANSWER_OPTION_VALUE, count: 2, correct: true },
          {
            value: MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE,
            count: 1,
            correct: true,
          },
          {
            value: MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            count: 1,
            correct: false,
          },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being correct', () => {
        const gameDocument = createTypeAnswerGame(
          [
            MOCK_TYPE_ANSWER_OPTION_VALUE,
            MOCK_TYPE_ANSWER_OPTION_VALUE,
            MOCK_TYPE_ANSWER_OPTION_VALUE,
          ],
          [MOCK_TYPE_ANSWER_OPTION_VALUE],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTypeAnswerDistribution(gameDocument, [
          { value: MOCK_TYPE_ANSWER_OPTION_VALUE, count: 3, correct: true },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle all answers being incorrect', () => {
        const gameDocument = createTypeAnswerGame(
          [
            MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
          ],
          [MOCK_TYPE_ANSWER_OPTION_VALUE],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTypeAnswerDistribution(gameDocument, [
          { value: MOCK_TYPE_ANSWER_OPTION_VALUE, count: 0, correct: true },
          {
            value: MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
            count: 3,
            correct: false,
          },
        ])

        expect(actual).toEqual(expected)
      })

      it('should handle no submitted answers', () => {
        const gameDocument = createTypeAnswerGame(
          [],
          [MOCK_TYPE_ANSWER_OPTION_VALUE],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTypeAnswerDistribution(gameDocument, [
          { value: MOCK_TYPE_ANSWER_OPTION_VALUE, count: 0, correct: true },
        ])

        expect(actual).toEqual(expected)
      })

      it('should ignore empty or whitespace-only answers', () => {
        const gameDocument = createTypeAnswerGame(
          [''],
          [MOCK_TYPE_ANSWER_OPTION_VALUE],
        )

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        const expected = buildExpectedTypeAnswerDistribution(gameDocument, [
          { value: MOCK_TYPE_ANSWER_OPTION_VALUE, count: 0, correct: true },
        ])

        expect(actual).toEqual(expected)
      })
    })

    describe('buildGameLeaderboardHostEvent', () => {
      it('should not include more than 5 players in the leaderboard', () => {
        const gameDocument = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({
            status: 'active',
            questionIndex: 0,
            leaderboard: buildLeaderboard(6),
          }),
        })

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        expect(actual.type).toEqual(GameEventType.GameLeaderboardHost)
        expectLeaderboard(actual as GamePodiumHostEvent, 5)
      })

      it('should include exactly 5 players as-is without trimming', () => {
        const gameDocument = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({
            status: 'active',
            questionIndex: 0,
            leaderboard: buildLeaderboard(5),
          }),
        })

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        expect(actual.type).toEqual(GameEventType.GameLeaderboardHost)
        expectLeaderboard(actual as GamePodiumHostEvent, 5)
      })

      it('should return an empty leaderboard if none is provided', () => {
        const gameDocument = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({
            status: 'active',
            questionIndex: 0,
            leaderboard: [],
          }),
        })

        const actual = buildHostGameEvent(gameDocument as GameDocument)
        expectLeaderboard(actual as GamePodiumHostEvent, 0)
      })
    })

    describe('buildGamePodiumHostEvent', () => {
      it('should not include more than 5 players in the leaderboard', () => {
        const gameDocument = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({
            status: 'active',
            leaderboard: buildLeaderboard(6),
          }),
        })

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        expect(actual.type).toEqual(GameEventType.GamePodiumHost)
        expectLeaderboard(actual as GamePodiumHostEvent, 5)
      })

      it('should include exactly 5 players as-is without trimming', () => {
        const gameDocument = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({
            status: 'active',
            leaderboard: buildLeaderboard(5),
          }),
        })

        const actual = buildHostGameEvent(gameDocument as GameDocument)

        expect(actual.type).toEqual(GameEventType.GamePodiumHost)
        expectLeaderboard(actual as GamePodiumHostEvent, 5)
      })

      it('should return an empty leaderboard if none is provided', () => {
        const gameDocument = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({
            status: 'active',
            leaderboard: [],
          }),
        })

        const actual = buildHostGameEvent(gameDocument as GameDocument)
        expect(actual.type).toEqual(GameEventType.GamePodiumHost)
        expectLeaderboard(actual as GamePodiumHostEvent, 0)
      })
    })
  })
})

function createMultiChoiceGame(answers: number[], correctIndexes?: number[]) {
  return createMockGameDocument({
    questions: [createMockMultiChoiceQuestionDocument()],
    currentTask: withMultiChoiceAnswers(answers, correctIndexes),
  })
}

function withMultiChoiceAnswers(answers: number[], correctIndexes: number[]) {
  return createMockQuestionResultTaskDocument({
    status: 'active',
    correctAnswers: correctIndexes.map((index) => ({
      type: QuestionType.MultiChoice,
      index,
    })),
    results: answers.map((answer) =>
      createMockQuestionResultTaskItemDocument({
        type: QuestionType.MultiChoice,
        answer: createMockQuestionTaskMultiChoiceAnswer({ answer }),
        correct: correctIndexes.includes(answer),
      }),
    ),
  })
}

function createRangeGame(answers: number[], correctValues?: number[]) {
  return createMockGameDocument({
    questions: [createMockRangeQuestionDocument()],
    currentTask: withRangeAnswers(answers, correctValues),
  })
}

function withRangeAnswers(answers: number[], correctValues: number[]) {
  return createMockQuestionResultTaskDocument({
    status: 'active',
    correctAnswers: correctValues.map((value) => ({
      type: QuestionType.Range,
      value,
    })),
    results: answers.map((answer) =>
      createMockQuestionResultTaskItemDocument({
        type: QuestionType.MultiChoice,
        answer: createMockQuestionTaskRangeAnswer({ answer }),
        correct: correctValues.includes(answer),
      }),
    ),
  })
}

function createTrueFalseGame(answers: boolean[], correctValues?: boolean[]) {
  return createMockGameDocument({
    questions: [createMockTrueFalseQuestionDocument()],
    currentTask: withTrueFalseAnswers(answers, correctValues),
  })
}

function withTrueFalseAnswers(answers: boolean[], correctValues: boolean[]) {
  return createMockQuestionResultTaskDocument({
    status: 'active',
    correctAnswers: correctValues.map((value) => ({
      type: QuestionType.TrueFalse,
      value,
    })),
    results: answers.map((answer) =>
      createMockQuestionResultTaskItemDocument({
        type: QuestionType.TrueFalse,
        answer: createMockQuestionTaskTrueFalseAnswer({ answer }),
        correct: correctValues.includes(answer),
      }),
    ),
  })
}

function createTypeAnswerGame(answers: string[], correctValues?: string[]) {
  return createMockGameDocument({
    questions: [createMockTypeAnswerQuestionDocument()],
    currentTask: withTypeAnswers(answers, correctValues),
  })
}

function withTypeAnswers(answers: string[], correctValues: string[]) {
  return createMockQuestionResultTaskDocument({
    status: 'active',
    correctAnswers: correctValues.map((value) => ({
      type: QuestionType.TypeAnswer,
      value,
    })),
    results: answers.map((answer) =>
      createMockQuestionResultTaskItemDocument({
        type: QuestionType.TypeAnswer,
        answer: createMockQuestionTaskTypeAnswer({ answer }),
        correct: correctValues.includes(answer),
      }),
    ),
  })
}

function buildExpectedMultiChoiceDistribution(
  game: Game,
  distribution: GameEventQuestionResultsMultiChoice['distribution'],
) {
  return expectGameResultHostEvent(game, {
    type: QuestionType.MultiChoice,
    distribution,
  })
}

function buildExpectedRangeDistribution(
  game: Game,
  distribution: GameEventQuestionResultsRange['distribution'],
) {
  return expectGameResultHostEvent(game, {
    type: QuestionType.Range,
    distribution,
  })
}

function buildExpectedTrueFalseDistribution(
  game: Game,
  distribution: GameEventQuestionResultsTrueFalse['distribution'],
) {
  return expectGameResultHostEvent(game, {
    type: QuestionType.TrueFalse,
    distribution,
  })
}

function buildExpectedTypeAnswerDistribution(
  game: Game,
  distribution: GameEventQuestionResultsTypeAnswer['distribution'],
) {
  return expectGameResultHostEvent(game, {
    type: QuestionType.TypeAnswer,
    distribution,
  })
}

function expectGameResultHostEvent(
  game: Game,
  results: GameEventQuestionResults,
): GameResultHostEvent {
  return {
    type: GameEventType.GameResultHost,
    game: {
      pin: game.pin,
    },
    question: {
      type: game.questions[0].type,
      question: game.questions[0].text,
    },
    results,
    pagination: {
      current: 1,
      total: 1,
    },
  }
}

function buildLeaderboard(count: number): LeaderboardTaskItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockLeaderboardTaskItem({
      position: i + 1,
      nickname: generateNickname(),
      score: Math.round((10000 / (i + 1)) * 10) / 10,
      streaks: i % 2 === 0 ? 3 : 0,
    }),
  )
}

function expectLeaderboard(
  event: GameLeaderboardHostEvent | GamePodiumHostEvent,
  expectedLength: number,
) {
  expect(event.leaderboard).toHaveLength(expectedLength)
  expect(event.leaderboard.every((p) => p.position <= 5)).toBe(true)
}
