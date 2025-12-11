import { GameEventType } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockGameDocument,
  createMockGamePlayerParticipantDocument,
  createMockLeaderboardTaskDocument,
  createMockQuestionResultTaskDocument,
  createMockQuestionResultTaskItemDocument,
} from '../../../../../test-utils/data'

import { buildGameResultPlayerEvent } from './game-result-event.utils'

describe('Game Result Event Utils', () => {
  describe('buildGameResultPlayerEvent', () => {
    it('builds result from current QuestionResult task when player has a result entry', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
        nickname: 'Alice',
        totalScore: 100,
        rank: 1,
        currentStreak: 3,
      })

      const questionResultTask = createMockQuestionResultTaskDocument({
        questionIndex: 0,
        results: [
          createMockQuestionResultTaskItemDocument({
            playerId,
            nickname: 'Alice',
            correct: true,
            lastScore: 40,
            totalScore: 100,
            position: 1,
            streak: 3,
          }),
        ],
      })

      const game = createMockGameDocument({
        participants: [player],
        currentTask: questionResultTask,
        questions: [
          // shape is irrelevant for this test, only length is used
          {} as never,
          {} as never,
        ],
      })

      const result = buildGameResultPlayerEvent(game as never, player)

      expect(result.type).toBe(GameEventType.GameResultPlayer)
      expect(result.player.nickname).toBe('Alice')
      expect(result.player.score).toEqual({
        correct: true,
        last: 40,
        total: 100,
        position: 1,
        streak: 3,
      })
      expect(result.player.behind).toBeUndefined()

      expect(result.pagination.current).toBe(
        questionResultTask.questionIndex + 1,
      )
      expect(result.pagination.total).toBe(game.questions.length)
    })

    it('falls back to player aggregate stats when no result entry exists in the QuestionResult task', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
        nickname: 'Bob',
        totalScore: 75,
        rank: 2,
        currentStreak: 1,
      })

      const questionResultTask = createMockQuestionResultTaskDocument({
        questionIndex: 1,
        // No result for this player
        results: [],
      })

      const game = createMockGameDocument({
        participants: [player],
        currentTask: questionResultTask,
        questions: [
          // shape is irrelevant for this test, only length is used
          {} as never,
          {} as never,
        ],
      })

      const result = buildGameResultPlayerEvent(game as never, player)

      expect(result.type).toBe(GameEventType.GameResultPlayer)
      expect(result.player.nickname).toBe('Bob')
      expect(result.player.score).toEqual({
        correct: false,
        last: 0,
        total: 75,
        position: 2,
        streak: 0,
      })
      expect(result.player.behind).toBeUndefined()

      expect(result.pagination.current).toBe(
        questionResultTask.questionIndex + 1,
      )
      expect(result.pagination.total).toBe(game.questions.length)
    })

    it('populates "behind" with the player directly ahead in score/position', () => {
      const currentPlayerId = uuidv4()
      const aheadPlayerId = uuidv4()

      const currentPlayer = createMockGamePlayerParticipantDocument({
        participantId: currentPlayerId,
        nickname: 'Charlie',
      })

      const aheadResult = createMockQuestionResultTaskItemDocument({
        playerId: aheadPlayerId,
        nickname: 'Alice',
        totalScore: 100,
        lastScore: 40,
        position: 1,
        streak: 3,
        correct: true,
      })

      const currentResult = createMockQuestionResultTaskItemDocument({
        playerId: currentPlayerId,
        nickname: 'Charlie',
        totalScore: 80,
        lastScore: 10,
        position: 2,
        streak: 1,
        correct: false,
      })

      const questionResultTask = createMockQuestionResultTaskDocument({
        questionIndex: 2,
        // Two different players: Alice (ahead) and Charlie (current).
        results: [aheadResult, currentResult],
      })

      const game = createMockGameDocument({
        participants: [currentPlayer],
        currentTask: questionResultTask,
        questions: [
          // shape is irrelevant for this test, only length is used
          {} as never,
          {} as never,
          {} as never,
        ],
      })

      const result = buildGameResultPlayerEvent(game as never, currentPlayer)

      expect(result.type).toBe(GameEventType.GameResultPlayer)
      expect(result.player.nickname).toBe('Charlie')

      // Score should belong to the current player (Charlie)
      expect(result.player.score).toEqual({
        correct: currentResult.correct,
        last: currentResult.lastScore,
        total: currentResult.totalScore,
        position: currentResult.position,
        streak: currentResult.streak,
      })

      // "behind" should describe the player ahead (Alice)
      expect(result.player.behind).toEqual({
        points: Math.abs(aheadResult.totalScore - currentResult.totalScore),
        nickname: aheadResult.nickname,
      })

      expect(result.pagination.current).toBe(
        questionResultTask.questionIndex + 1,
      )
      expect(result.pagination.total).toBe(game.questions.length)
    })

    it('uses the last QuestionResult task when current task is Leaderboard', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
        nickname: 'Dana',
      })

      const lastQuestionResultTask = createMockQuestionResultTaskDocument({
        questionIndex: 1,
        results: [
          createMockQuestionResultTaskItemDocument({
            playerId,
            nickname: 'Dana',
            correct: true,
            lastScore: 25,
            totalScore: 55,
            position: 1,
            streak: 2,
          }),
        ],
      })

      const leaderboardTask = createMockLeaderboardTaskDocument({})

      const game = createMockGameDocument({
        participants: [player],
        currentTask: leaderboardTask,
        previousTasks: [lastQuestionResultTask],
        questions: [
          // shape is irrelevant for this test, only length is used
          {} as never,
          {} as never,
        ],
      })

      const result = buildGameResultPlayerEvent(game as never, player)

      expect(result.type).toBe(GameEventType.GameResultPlayer)
      expect(result.player.nickname).toBe('Dana')
      expect(result.player.score).toEqual({
        correct: true,
        last: 25,
        total: 55,
        position: 1,
        streak: 2,
      })
      expect(result.player.behind).toBeUndefined()

      expect(result.pagination.current).toBe(
        lastQuestionResultTask.questionIndex + 1,
      )
      expect(result.pagination.total).toBe(game.questions.length)
    })

    it('throws when current task is Leaderboard but no QuestionResult task exists', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
        nickname: 'Eve',
      })

      const leaderboardTask = createMockLeaderboardTaskDocument({})

      const game = createMockGameDocument({
        participants: [player],
        currentTask: leaderboardTask,
        previousTasks: [], // no QuestionResult tasks
        questions: [
          // shape is irrelevant for this test, only length is used
          {} as never,
        ],
      })

      expect(() => buildGameResultPlayerEvent(game as never, player)).toThrow(
        'Expected at least one QuestionResultTask when building GameResultPlayerEvent for Leaderboard/Podium task',
      )
    })
  })
})
