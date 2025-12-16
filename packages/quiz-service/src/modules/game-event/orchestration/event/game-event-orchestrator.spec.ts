import {
  GameEventType,
  GameParticipantType,
  GameStatus,
  QuestionType,
} from '@quiz/common'

import {
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockGamePlayerParticipantDocument,
  createMockLeaderboardTaskDocument,
  createMockLobbyTaskDocument,
  createMockMultiChoiceQuestionDocument,
  createMockPodiumTaskDocument,
  createMockQuestionResultTaskDocument,
  createMockQuestionTaskDocument,
  createMockQuestionTaskMultiChoiceAnswer,
  createMockQuitTaskDocument,
} from '../../../../../test-utils/data'

import { GameEventOrchestrator } from './game-event-orchestrator'

describe('GameEventOrchestrator', () => {
  let gameEventOrchestrator: GameEventOrchestrator

  beforeEach(() => {
    gameEventOrchestrator = new GameEventOrchestrator()
  })

  describe('buildHostGameEvent', () => {
    describe('Lobby Task', () => {
      it('should return loading event when lobby task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockLobbyTaskDocument(),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return lobby host event when lobby task status is active', () => {
        const player = createMockGamePlayerParticipantDocument()
        const game = createMockGameDocument({
          currentTask: { ...createMockLobbyTaskDocument(), status: 'active' },
          participants: [player],
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLobbyHost)
        if (result.type === GameEventType.GameLobbyHost) {
          expect(result.game.id).toBe(game._id)
          expect(result.game.pin).toBe(game.pin)
          expect(result.players).toHaveLength(1)
          expect(result.players[0]).toEqual({
            id: player.participantId,
            nickname: player.nickname,
          })
        }
      })

      it('should return begin host event when lobby task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: {
            ...createMockLobbyTaskDocument(),
            status: 'completed',
          },
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameBeginHost)
      })

      it('should filter out non-player participants in lobby host event', () => {
        const player = createMockGamePlayerParticipantDocument()
        const host = createMockGameHostParticipantDocument()
        const game = createMockGameDocument({
          currentTask: { ...createMockLobbyTaskDocument(), status: 'active' },
          participants: [player, host],
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLobbyHost)
        if (result.type === GameEventType.GameLobbyHost) {
          expect(result.players).toHaveLength(1)
          expect(result.players[0].id).toBe(player.participantId)
        }
      })
    })

    describe('Question Task', () => {
      it('should return question preview host event when question task status is pending', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameQuestionPreviewHost)
      })

      it('should return question host event when question task status is active', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          currentAnswerSubmissions: 3,
          totalAnswerSubmissions: 5,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should use default metadata values when not provided', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should return loading event when question task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionTaskDocument({ status: 'completed' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Question Result Task', () => {
      it('should return loading event when question result task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument({
            status: 'pending',
          }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return result host event when question result task status is active', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
          }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameResultHost)
      })

      it('should return loading event when question result task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument({
            status: 'completed',
          }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Leaderboard Task', () => {
      it('should return loading event when leaderboard task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return leaderboard host event when leaderboard task status is active', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLeaderboardHost)
      })

      it('should return loading event when leaderboard task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({
            status: 'completed',
          }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Podium Task', () => {
      it('should return loading event when podium task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return podium host event when podium task status is active', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GamePodiumHost)
      })

      it('should return loading event when podium task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({ status: 'completed' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Quit Task', () => {
      it('should return quit event when task is quit task with active status', () => {
        const game = createMockGameDocument({
          status: GameStatus.Active,
          currentTask: createMockQuitTaskDocument(),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameQuitEvent)
        if (result.type === GameEventType.GameQuitEvent) {
          expect(result.status).toBe(GameStatus.Active)
        }
      })

      it('should return quit event when task is quit task with completed status', () => {
        const game = createMockGameDocument({
          status: GameStatus.Completed,
          currentTask: createMockQuitTaskDocument(),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameQuitEvent)
        if (result.type === GameEventType.GameQuitEvent) {
          expect(result.status).toBe(GameStatus.Completed)
        }
      })
    })

    describe('Error Cases', () => {
      it('should throw error for unknown task type', () => {
        const game = createMockGameDocument({
          currentTask: {
            _id: 'unknown-task-id',
            type: 'unknown' as never,
            status: 'active',
            created: new Date(),
          },
        })

        expect(() =>
          gameEventOrchestrator.buildHostGameEvent(game as never),
        ).toThrow('Unknown task')
      })
    })

    describe('Edge Cases', () => {
      it('should handle metadata with only currentAnswerSubmissions', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          currentAnswerSubmissions: 3,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should handle metadata with only totalAnswerSubmissions', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          totalAnswerSubmissions: 5,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should handle metadata with null values', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          currentAnswerSubmissions: null as never,
          totalAnswerSubmissions: null as never,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should handle empty participants array in lobby host event', () => {
        const game = createMockGameDocument({
          currentTask: { ...createMockLobbyTaskDocument(), status: 'active' },
          participants: [],
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLobbyHost)
        if (result.type === GameEventType.GameLobbyHost) {
          expect(result.players).toHaveLength(0)
        }
      })

      it('should handle game with valid questions for question task', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameQuestionPreviewHost)
      })
    })

    describe('Edge Cases', () => {
      it('should handle metadata with only currentAnswerSubmissions', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          currentAnswerSubmissions: 3,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should handle metadata with only totalAnswerSubmissions', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          totalAnswerSubmissions: 5,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should handle metadata with null values', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never, {
          currentAnswerSubmissions: null as never,
          totalAnswerSubmissions: null as never,
        })

        expect(result.type).toBe(GameEventType.GameQuestionHost)
      })

      it('should handle empty participants array in lobby host event', () => {
        const game = createMockGameDocument({
          currentTask: { ...createMockLobbyTaskDocument(), status: 'active' },
          participants: [],
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameLobbyHost)
        if (result.type === GameEventType.GameLobbyHost) {
          expect(result.players).toHaveLength(0)
        }
      })

      it('should handle game with valid questions for question task', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildHostGameEvent(game as never)

        expect(result.type).toBe(GameEventType.GameQuestionPreviewHost)
      })
    })
  })

  describe('buildPlayerGameEvent', () => {
    const mockPlayer = createMockGamePlayerParticipantDocument()

    describe('Lobby Task', () => {
      it('should return loading event when lobby task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockLobbyTaskDocument(),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return lobby player event when lobby task status is active', () => {
        const game = createMockGameDocument({
          currentTask: { ...createMockLobbyTaskDocument(), status: 'active' },
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLobbyPlayer)
        if (result.type === GameEventType.GameLobbyPlayer) {
          expect(result.player.nickname).toBe(mockPlayer.nickname)
        }
      })

      it('should return begin player event when lobby task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: {
            ...createMockLobbyTaskDocument(),
            status: 'completed',
          },
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameBeginPlayer)
        if (result.type === GameEventType.GameBeginPlayer) {
          expect(result.player.nickname).toBe(mockPlayer.nickname)
        }
      })
    })

    describe('Question Task', () => {
      it('should return question preview player event when question task status is pending', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuestionPreviewPlayer)
      })

      it('should return question player event when question task status is active', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      })

      it('should return question player event when question task status is completed', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'completed' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      })

      it('should include player answer submission in metadata when provided', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })
        const playerAnswer = createMockQuestionTaskMultiChoiceAnswer()

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
          {
            playerAnswerSubmission: playerAnswer,
          },
        )

        expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      })
    })

    describe('Question Result Task', () => {
      it('should return loading event when question result task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument({
            status: 'pending',
          }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return result player event when question result task status is active', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument({
            status: 'active',
          }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameResultPlayer)
      })

      it('should return loading event when question result task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument({
            status: 'completed',
          }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Leaderboard Task', () => {
      it('should return loading event when leaderboard task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return result player event when leaderboard task status is active', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({ status: 'active' }),
          previousTasks: [createMockQuestionResultTaskDocument()],
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameResultPlayer)
      })

      it('should return loading event when leaderboard task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument({
            status: 'completed',
          }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Podium Task', () => {
      it('should return loading event when podium task status is pending', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })

      it('should return result player event when podium task status is active', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({ status: 'active' }),
          previousTasks: [createMockQuestionResultTaskDocument()],
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameResultPlayer)
      })

      it('should return loading event when podium task status is completed', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument({ status: 'completed' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameLoading)
      })
    })

    describe('Quit Task', () => {
      it('should return quit event when task is quit task with active status', () => {
        const game = createMockGameDocument({
          status: GameStatus.Active,
          currentTask: createMockQuitTaskDocument(),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuitEvent)
        if (result.type === GameEventType.GameQuitEvent) {
          expect(result.status).toBe(GameStatus.Active)
        }
      })

      it('should return quit event when task is quit task with completed status', () => {
        const game = createMockGameDocument({
          status: GameStatus.Completed,
          currentTask: createMockQuitTaskDocument(),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuitEvent)
        if (result.type === GameEventType.GameQuitEvent) {
          expect(result.status).toBe(GameStatus.Completed)
        }
      })
    })

    describe('Error Cases', () => {
      it('should throw error for unknown task type', () => {
        const game = createMockGameDocument({
          currentTask: {
            _id: 'unknown-task-id',
            type: 'unknown' as never,
            status: 'active',
            created: new Date(),
          },
        })

        expect(() =>
          gameEventOrchestrator.buildPlayerGameEvent(game as never, mockPlayer),
        ).toThrow('Unknown task')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty metadata object', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
          {},
        )

        expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      })

      it('should handle undefined metadata', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      })

      it('should handle player with minimal required properties', () => {
        const game = createMockGameDocument({
          currentTask: { ...createMockLobbyTaskDocument(), status: 'active' },
        })
        const minimalPlayer = {
          participantId: 'minimal-player-id',
          nickname: 'MinimalPlayer',
          type: 'player' as const,
        }

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          minimalPlayer as never,
        )

        expect(result.type).toBe(GameEventType.GameLobbyPlayer)
        if (result.type === GameEventType.GameLobbyPlayer) {
          expect(result.player.nickname).toBe('MinimalPlayer')
        }
      })

      it('should handle game with valid questions for question task', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'pending' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
        )

        expect(result.type).toBe(GameEventType.GameQuestionPreviewPlayer)
      })

      it('should handle metadata with null playerAnswerSubmission', () => {
        const game = createMockGameDocument({
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({ status: 'active' }),
        })

        const result = gameEventOrchestrator.buildPlayerGameEvent(
          game as never,
          mockPlayer,
          {
            playerAnswerSubmission: null as never,
          },
        )

        expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      })
    })
  })

  describe('toQuestionTaskAnswer', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-01T10:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('builds MultiChoice answer from optionIndex', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswer('p1', {
        type: QuestionType.MultiChoice,
        optionIndex: 2,
      } as never)

      expect(result).toEqual({
        type: QuestionType.MultiChoice,
        playerId: 'p1',
        answer: 2,
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('builds Range answer from value', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswer('p1', {
        type: QuestionType.Range,
        value: 42,
      } as never)

      expect(result).toEqual({
        type: QuestionType.Range,
        playerId: 'p1',
        answer: 42,
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('builds TrueFalse answer from value', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswer('p1', {
        type: QuestionType.TrueFalse,
        value: true,
      } as never)

      expect(result).toEqual({
        type: QuestionType.TrueFalse,
        playerId: 'p1',
        answer: true,
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('builds TypeAnswer answer from value', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswer('p1', {
        type: QuestionType.TypeAnswer,
        value: 'Stockholm',
      } as never)

      expect(result).toEqual({
        type: QuestionType.TypeAnswer,
        playerId: 'p1',
        answer: 'Stockholm',
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('builds Pin answer from positionX/positionY as "x,y"', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswer('p1', {
        type: QuestionType.Pin,
        positionX: 12,
        positionY: 34,
      } as never)

      expect(result).toEqual({
        type: QuestionType.Pin,
        playerId: 'p1',
        answer: '12,34',
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('builds Puzzle answer from values array', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswer('p1', {
        type: QuestionType.Puzzle,
        values: ['a', 'b', 'c'],
      } as never)

      expect(result).toEqual({
        type: QuestionType.Puzzle,
        playerId: 'p1',
        answer: ['a', 'b', 'c'],
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })
  })

  describe('toQuestionTaskAnswerFromString', () => {
    it('deserializes MultiChoice answer', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswerFromString(
        JSON.stringify({
          type: QuestionType.MultiChoice,
          playerId: 'p1',
          answer: 1,
          created: '2025-01-01T10:00:00.000Z',
        }),
      )

      expect(result).toEqual({
        type: QuestionType.MultiChoice,
        playerId: 'p1',
        answer: 1,
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('deserializes Range answer', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswerFromString(
        JSON.stringify({
          type: QuestionType.Range,
          playerId: 'p1',
          answer: 77,
          created: '2025-01-01T10:00:00.000Z',
        }),
      )

      expect(result).toEqual({
        type: QuestionType.Range,
        playerId: 'p1',
        answer: 77,
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('deserializes TrueFalse answer', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswerFromString(
        JSON.stringify({
          type: QuestionType.TrueFalse,
          playerId: 'p1',
          answer: false,
          created: '2025-01-01T10:00:00.000Z',
        }),
      )

      expect(result).toEqual({
        type: QuestionType.TrueFalse,
        playerId: 'p1',
        answer: false,
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('deserializes TypeAnswer answer', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswerFromString(
        JSON.stringify({
          type: QuestionType.TypeAnswer,
          playerId: 'p1',
          answer: 'hello',
          created: '2025-01-01T10:00:00.000Z',
        }),
      )

      expect(result).toEqual({
        type: QuestionType.TypeAnswer,
        playerId: 'p1',
        answer: 'hello',
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('deserializes Pin answer', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswerFromString(
        JSON.stringify({
          type: QuestionType.Pin,
          playerId: 'p1',
          answer: '10,20',
          created: '2025-01-01T10:00:00.000Z',
        }),
      )

      expect(result).toEqual({
        type: QuestionType.Pin,
        playerId: 'p1',
        answer: '10,20',
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })

    it('deserializes Puzzle answer', () => {
      const result = gameEventOrchestrator.toQuestionTaskAnswerFromString(
        JSON.stringify({
          type: QuestionType.Puzzle,
          playerId: 'p1',
          answer: ['x', 'y'],
          created: '2025-01-01T10:00:00.000Z',
        }),
      )

      expect(result).toEqual({
        type: QuestionType.Puzzle,
        playerId: 'p1',
        answer: ['x', 'y'],
        created: new Date('2025-01-01T10:00:00.000Z'),
      })
    })
  })

  describe('toBaseQuestionTaskEventMetaDataTuple', () => {
    it('returns answers and populates current/total submissions (players only)', () => {
      const serializedAnswers = [
        JSON.stringify({
          type: QuestionType.MultiChoice,
          playerId: 'p1',
          answer: 0,
          created: '2025-01-01T10:00:00.000Z',
        }),
        JSON.stringify({
          type: QuestionType.TrueFalse,
          playerId: 'p2',
          answer: true,
          created: '2025-01-01T10:01:00.000Z',
        }),
      ]

      const participants = [
        { type: GameParticipantType.HOST, participantId: 'h1' },
        { type: GameParticipantType.PLAYER, participantId: 'p1' },
        { type: GameParticipantType.PLAYER, participantId: 'p2' },
        { type: GameParticipantType.PLAYER, participantId: 'p3' },
      ] as never

      const [answers, meta] =
        gameEventOrchestrator.toBaseQuestionTaskEventMetaDataTuple(
          serializedAnswers,
          { someOtherField: 'keep-me' } as never,
          participants,
        )

      expect(answers).toEqual([
        {
          type: QuestionType.MultiChoice,
          playerId: 'p1',
          answer: 0,
          created: new Date('2025-01-01T10:00:00.000Z'),
        },
        {
          type: QuestionType.TrueFalse,
          playerId: 'p2',
          answer: true,
          created: new Date('2025-01-01T10:01:00.000Z'),
        },
      ])

      expect(meta).toEqual({
        someOtherField: 'keep-me',
        currentAnswerSubmissions: 2,
        totalAnswerSubmissions: 3,
      })
    })
  })

  describe('toPlayerQuestionPlayerEventMetaData', () => {
    it('returns playerAnswerSubmission when answer exists for participantId', () => {
      const answers = [
        {
          type: QuestionType.MultiChoice,
          playerId: 'p1',
          answer: 1,
          created: new Date('2025-01-01T10:00:00.000Z'),
        },
        {
          type: QuestionType.MultiChoice,
          playerId: 'p2',
          answer: 2,
          created: new Date('2025-01-01T10:00:00.000Z'),
        },
      ] as never

      const meta = gameEventOrchestrator.toPlayerQuestionPlayerEventMetaData(
        answers,
        { participantId: 'p2' } as never,
      )

      expect(meta).toEqual({
        playerAnswerSubmission: {
          type: QuestionType.MultiChoice,
          playerId: 'p2',
          answer: 2,
          created: new Date('2025-01-01T10:00:00.000Z'),
        },
      })
    })

    it('returns undefined playerAnswerSubmission when answer does not exist', () => {
      const answers = [
        {
          type: QuestionType.MultiChoice,
          playerId: 'p1',
          answer: 1,
          created: new Date('2025-01-01T10:00:00.000Z'),
        },
      ] as never

      const meta = gameEventOrchestrator.toPlayerQuestionPlayerEventMetaData(
        answers,
        { participantId: 'p2' } as never,
      )

      expect(meta).toEqual({
        playerAnswerSubmission: undefined,
      })
    })
  })

  describe('buildGameQuitEvent', () => {
    it('returns quit event for provided status', () => {
      const result = gameEventOrchestrator.buildGameQuitEvent(GameStatus.Active)

      expect(result.type).toBe(GameEventType.GameQuitEvent)
      if (result.type === GameEventType.GameQuitEvent) {
        expect(result.status).toBe(GameStatus.Active)
      }
    })
  })
})
