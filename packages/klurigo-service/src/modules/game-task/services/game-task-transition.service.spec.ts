import { GameStatus } from '@klurigo/common'

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
  createMockQuitTaskDocument,
} from '../../../../test-utils/data'
import { GameAnswerRepository } from '../../game-core/repositories'
import { isParticipantPlayer } from '../../game-core/utils'
import { GameResultService } from '../../game-result/services'
import { IllegalTaskTypeException } from '../exceptions'

import { GameTaskTransitionService } from './game-task-transition.service'

jest.mock('../../game-core/utils')

jest.mock('../utils', () => ({
  buildQuestionTask: jest.fn(),
  buildQuestionResultTask: jest.fn(),
  buildLeaderboardTask: jest.fn(),
  buildPodiumTask: jest.fn(),
  buildQuitTask: jest.fn(),
  updateParticipantsAndBuildLeaderboard: jest.fn(),
}))

// eslint-disable-next-line import/order
import {
  buildLeaderboardTask,
  buildPodiumTask,
  buildQuestionResultTask,
  buildQuestionTask,
  buildQuitTask,
  updateParticipantsAndBuildLeaderboard,
} from '../utils'

const mockIsParticipantPlayer = isParticipantPlayer as jest.MockedFunction<
  typeof isParticipantPlayer
>

describe('GameTaskTransitionService', () => {
  let service: GameTaskTransitionService
  let gameAnswerRepository: jest.Mocked<GameAnswerRepository>
  let gameResultService: jest.Mocked<GameResultService>
  let logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock }

  beforeEach(() => {
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    gameAnswerRepository = {
      findAllAnswersByGameId: jest.fn().mockResolvedValue([]),
      clear: jest.fn().mockResolvedValue(undefined),
      submitOnce: jest.fn(),
    } as unknown as jest.Mocked<GameAnswerRepository>

    gameResultService = {
      createGameResult: jest.fn().mockResolvedValue({} as never),
    } as unknown as jest.Mocked<GameResultService>

    service = new GameTaskTransitionService(
      gameAnswerRepository,
      gameResultService,
    )
    ;(service as any).logger = logger

    mockIsParticipantPlayer.mockReset()
    mockIsParticipantPlayer.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTaskTransitionCallback', () => {
    it('returns undefined for lobby pending', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument({ status: 'pending' }),
      })

      expect(
        service.getTaskTransitionCallback(gameDoc as never),
      ).toBeUndefined()
    })

    it('lobby completed transitions to question task and increments nextQuestion', async () => {
      const lobbyTask = createMockLobbyTaskDocument({ status: 'completed' })
      const gameDoc = createMockGameDocument({
        currentTask: lobbyTask,
        nextQuestion: 0,
      })

      const nextTask = createMockQuestionTaskDocument({
        status: 'pending',
        questionIndex: 0,
      })
      ;(buildQuestionTask as jest.Mock)
        .mockReset()
        .mockReturnValue(nextTask as never)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(lobbyTask)
      expect(gameDoc.currentTask).toBe(nextTask)
      expect(gameDoc.nextQuestion).toBe(1)
      expect(buildQuestionTask).toHaveBeenCalledWith(gameDoc as never)
    })

    it('question pending sets presented timestamp', async () => {
      const task = createMockQuestionTaskDocument({
        status: 'pending',
        questionIndex: 0,
        presented: undefined,
      })
      const gameDoc = createMockGameDocument({
        currentTask: task,
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      expect((gameDoc.currentTask as any).presented).toBeUndefined()

      await callback!(gameDoc as never)

      expect((gameDoc.currentTask as any).presented).toBeInstanceOf(Date)
    })

    it('returns undefined for question active', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'active',
          questionIndex: 0,
        }),
      })

      expect(
        service.getTaskTransitionCallback(gameDoc as never),
      ).toBeUndefined()
    })

    it('question completed reads answers from repository, clears answers, stores them, and transitions to question result task', async () => {
      const task = createMockQuestionTaskDocument({
        status: 'completed',
        questionIndex: 0,
      })
      const gameDoc = createMockGameDocument({
        currentTask: task,
        _id: 'game-1',
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      const parsedAnswers = [
        { participantId: 'p1' },
        { participantId: 'p2' },
      ] as any[]

      gameAnswerRepository.findAllAnswersByGameId.mockResolvedValue(
        parsedAnswers,
      )

      const nextTask = createMockQuestionResultTaskDocument({
        status: 'pending',
      })
      ;(buildQuestionResultTask as jest.Mock)
        .mockReset()
        .mockReturnValue(nextTask as never)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameAnswerRepository.findAllAnswersByGameId).toHaveBeenCalledWith(
        'game-1',
      )
      expect(gameAnswerRepository.clear).toHaveBeenCalledWith('game-1')

      expect((task as any).answers).toEqual(parsedAnswers)
      expect(gameDoc.previousTasks).toContain(task)
      expect(gameDoc.currentTask).toBe(nextTask)
      expect(buildQuestionResultTask).toHaveBeenCalledWith(gameDoc as never)
    })

    it('question result completed builds leaderboard when there are questions remaining', async () => {
      const task = createMockQuestionResultTaskDocument({ status: 'completed' })
      const gameDoc = createMockGameDocument({
        currentTask: task,
        questions: [
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
        ],
        nextQuestion: 0,
      })

      const leaderboardItems = [
        { participantId: 'p1', score: 10, rank: 1 },
      ] as any[]
      ;(updateParticipantsAndBuildLeaderboard as jest.Mock)
        .mockReset()
        .mockReturnValue(leaderboardItems as never)

      const leaderboardTask = createMockLeaderboardTaskDocument({
        status: 'pending',
      })
      ;(buildLeaderboardTask as jest.Mock)
        .mockReset()
        .mockReturnValue(leaderboardTask as never)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(task)
      expect(updateParticipantsAndBuildLeaderboard).toHaveBeenCalledWith(
        gameDoc as never,
      )
      expect(buildLeaderboardTask).toHaveBeenCalledWith(
        gameDoc as never,
        leaderboardItems as never,
      )
      expect(buildPodiumTask).not.toHaveBeenCalled()
      expect(gameResultService.createGameResult).not.toHaveBeenCalled()
      expect(gameDoc.currentTask).toBe(leaderboardTask)
    })

    it('question result completed builds podium and creates game result when last question and players exist', async () => {
      const task = createMockQuestionResultTaskDocument({ status: 'completed' })
      const host = createMockGameHostParticipantDocument()
      const player = createMockGamePlayerParticipantDocument()

      const gameDoc = createMockGameDocument({
        currentTask: task,
        participants: [host, player],
        questions: [createMockMultiChoiceQuestionDocument()],
        nextQuestion: 1,
      })

      const leaderboardItems = [
        { participantId: 'p1', score: 10, rank: 1 },
      ] as any[]
      ;(updateParticipantsAndBuildLeaderboard as jest.Mock)
        .mockReset()
        .mockReturnValue(leaderboardItems as never)

      const podiumTask = createMockPodiumTaskDocument({ status: 'pending' })
      ;(buildPodiumTask as jest.Mock)
        .mockReset()
        .mockReturnValue(podiumTask as never)

      mockIsParticipantPlayer.mockImplementation((p: any) => p !== host)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(task)
      expect(buildPodiumTask).toHaveBeenCalledWith(
        gameDoc as never,
        leaderboardItems as never,
      )
      expect(buildLeaderboardTask).not.toHaveBeenCalled()
      expect(gameResultService.createGameResult).toHaveBeenCalledWith(
        gameDoc as never,
      )
      expect(gameDoc.currentTask).toBe(podiumTask)
    })

    it('question result completed builds podium and creates game result when last question and no players exist', async () => {
      const task = createMockQuestionResultTaskDocument({ status: 'completed' })
      const host = createMockGameHostParticipantDocument()

      const gameDoc = createMockGameDocument({
        currentTask: task,
        participants: [host],
        questions: [createMockMultiChoiceQuestionDocument()],
        nextQuestion: 1,
      })

      const leaderboardItems = [
        { participantId: 'p1', score: 10, rank: 1 },
      ] as any[]
      ;(updateParticipantsAndBuildLeaderboard as jest.Mock)
        .mockReset()
        .mockReturnValue(leaderboardItems as never)

      const podiumTask = createMockPodiumTaskDocument({ status: 'pending' })
      ;(buildPodiumTask as jest.Mock)
        .mockReset()
        .mockReturnValue(podiumTask as never)

      mockIsParticipantPlayer.mockReturnValue(false)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(task)
      expect(buildPodiumTask).toHaveBeenCalledWith(
        gameDoc as never,
        leaderboardItems as never,
      )
      expect(buildLeaderboardTask).not.toHaveBeenCalled()
      expect(gameResultService.createGameResult).toHaveBeenCalledWith(
        gameDoc as never,
      )
      expect(gameDoc.currentTask).toBe(podiumTask)
    })

    it('leaderboard completed transitions to question task and increments nextQuestion', async () => {
      const leaderboard = createMockLeaderboardTaskDocument({
        status: 'completed',
      })
      const gameDoc = createMockGameDocument({
        currentTask: leaderboard,
        nextQuestion: 1,
      })

      const nextTask = createMockQuestionTaskDocument({
        status: 'pending',
        questionIndex: 1,
      })
      ;(buildQuestionTask as jest.Mock)
        .mockReset()
        .mockReturnValue(nextTask as never)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(leaderboard)
      expect(gameDoc.currentTask).toBe(nextTask)
      expect(gameDoc.nextQuestion).toBe(2)
      expect(buildQuestionTask).toHaveBeenCalledWith(gameDoc as never)
    })

    it('podium completed transitions to quit and sets status Completed when players exist', async () => {
      const podium = createMockPodiumTaskDocument({ status: 'completed' })
      const host = createMockGameHostParticipantDocument()
      const player = createMockGamePlayerParticipantDocument()

      const gameDoc = createMockGameDocument({
        currentTask: podium,
        participants: [host, player],
      })

      const quitTask = createMockQuitTaskDocument()
      ;(buildQuitTask as jest.Mock)
        .mockReset()
        .mockReturnValue(quitTask as never)

      mockIsParticipantPlayer.mockImplementation((p: any) => p !== host)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(podium)
      expect(buildQuitTask).toHaveBeenCalled()
      expect(gameDoc.currentTask).toBe(quitTask)
      expect(gameDoc.status).toBe(GameStatus.Completed)
    })

    it('podium completed transitions to quit and sets status Completed when no players exist', async () => {
      const podium = createMockPodiumTaskDocument({ status: 'completed' })
      const host = createMockGameHostParticipantDocument()

      const gameDoc = createMockGameDocument({
        currentTask: podium,
        participants: [host],
      })

      const quitTask = createMockQuitTaskDocument()
      ;(buildQuitTask as jest.Mock)
        .mockReset()
        .mockReturnValue(quitTask as never)

      mockIsParticipantPlayer.mockReturnValue(false)

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await callback!(gameDoc as never)

      expect(gameDoc.previousTasks).toContain(podium)
      expect(buildQuitTask).toHaveBeenCalled()
      expect(gameDoc.currentTask).toBe(quitTask)
      expect(gameDoc.status).toBe(GameStatus.Completed)
    })

    it('returns undefined for unsupported task type/status combinations', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument({ status: 'active' }),
      })

      expect(
        service.getTaskTransitionCallback(gameDoc as never),
      ).toBeUndefined()
    })
  })

  describe('getTaskTransitionDelay', () => {
    it('returns 3000ms for lobby pending task', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument({ status: 'pending' }),
      })

      expect(service.getTaskTransitionDelay(gameDoc as never)).toBe(3000)
    })

    it('returns 3000ms for lobby completed task', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument({ status: 'completed' }),
      })

      expect(service.getTaskTransitionDelay(gameDoc as never)).toBe(3000)
    })

    it('returns exact pending duration for question pending task', () => {
      const text = 'Short question?'
      const question = createMockMultiChoiceQuestionDocument({ text })

      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'pending',
          questionIndex: 0,
        }),
        questions: [question],
      })

      const wordCount = text.trim().split(/\s+/).length
      const readingDuration = (wordCount / 220) * 60000
      const characterDuration = Math.min(text.length * 100, 15000)
      const expected = Math.max(readingDuration, characterDuration)

      expect(service.getTaskTransitionDelay(gameDoc as never)).toBe(expected)
    })

    it('returns durationInSeconds * 1000 for question active task', () => {
      const question = createMockMultiChoiceQuestionDocument({
        text: 'Test question?',
        duration: 5,
      })

      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'active',
          questionIndex: 0,
        }),
        questions: [question],
      })

      expect(service.getTaskTransitionDelay(gameDoc as never)).toBe(5000)
    })

    it('returns 0 for unsupported task type/status combinations', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionResultTaskDocument({
          status: 'completed',
        }),
      })

      expect(service.getTaskTransitionDelay(gameDoc as never)).toBe(0)
    })
  })

  describe('getQuestionTaskPendingDuration', () => {
    it('returns max(readingDuration, characterDuration) for short text', () => {
      const text = 'Short question?'
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'pending',
          questionIndex: 0,
        }),
        questions: [createMockMultiChoiceQuestionDocument({ text })],
      })

      const wordCount = text.trim().split(/\s+/).length
      const readingDuration = (wordCount / 220) * 60000
      const characterDuration = Math.min(text.length * 100, 15000)
      const expected = Math.max(readingDuration, characterDuration)

      const duration = (service as any).getQuestionTaskPendingDuration(
        gameDoc as never,
      )
      expect(duration).toBe(expected)
    })

    it('caps character-based fallback at 15000ms', () => {
      const text = 'x'.repeat(1000)
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'pending',
          questionIndex: 0,
        }),
        questions: [createMockMultiChoiceQuestionDocument({ text })],
      })

      const duration = (service as any).getQuestionTaskPendingDuration(
        gameDoc as never,
      )
      expect(duration).toBeGreaterThanOrEqual(15000)
      expect(duration).toBe(15000)
    })

    it('throws IllegalTaskTypeException for non-question task', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument({ status: 'pending' }),
      })

      expect(() =>
        (service as any).getQuestionTaskPendingDuration(gameDoc as never),
      ).toThrow(IllegalTaskTypeException)
    })

    it('throws Error for invalid question index (too high)', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'pending',
          questionIndex: 5,
        }),
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      expect(() =>
        (service as any).getQuestionTaskPendingDuration(gameDoc as never),
      ).toThrow('Invalid question index')
    })

    it('throws Error for invalid question index (negative)', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'pending',
          questionIndex: -1,
        }),
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      expect(() =>
        (service as any).getQuestionTaskPendingDuration(gameDoc as never),
      ).toThrow('Invalid question index')
    })
  })

  describe('getQuestionTaskActiveDuration', () => {
    it('returns duration in milliseconds from question duration in seconds', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'active',
          questionIndex: 0,
        }),
        questions: [
          createMockMultiChoiceQuestionDocument({
            text: 'Test question?',
            duration: 5,
          }),
        ],
      })

      const duration = (service as any).getQuestionTaskActiveDuration(
        gameDoc as never,
      )
      expect(duration).toBe(5000)
    })

    it('throws IllegalTaskTypeException for non-question task', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument({ status: 'active' }),
      })

      expect(() =>
        (service as any).getQuestionTaskActiveDuration(gameDoc as never),
      ).toThrow(IllegalTaskTypeException)
    })

    it('throws Error for invalid question index (too high)', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'active',
          questionIndex: 5,
        }),
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      expect(() =>
        (service as any).getQuestionTaskActiveDuration(gameDoc as never),
      ).toThrow('Invalid question index')
    })

    it('throws Error for invalid question index (negative)', () => {
      const gameDoc = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument({
          status: 'active',
          questionIndex: -1,
        }),
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      expect(() =>
        (service as any).getQuestionTaskActiveDuration(gameDoc as never),
      ).toThrow('Invalid question index')
    })
  })

  describe('Repository integration and error handling', () => {
    it('question completed: propagates repository findAllAnswersByGameId failure and does not clear or transition', async () => {
      const task = createMockQuestionTaskDocument({
        status: 'completed',
        questionIndex: 0,
      })
      const gameDoc = createMockGameDocument({
        currentTask: task,
        _id: 'game-1',
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      gameAnswerRepository.findAllAnswersByGameId.mockRejectedValue(
        new Error('Repository connection failed'),
      )

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await expect(callback!(gameDoc as never)).rejects.toThrow(
        'Repository connection failed',
      )

      expect(gameAnswerRepository.clear).not.toHaveBeenCalled()
      expect(buildQuestionResultTask).not.toHaveBeenCalled()
      expect(gameDoc.previousTasks).not.toContain(task)
    })

    it('question completed: propagates repository clear failure and does not transition task', async () => {
      const task = createMockQuestionTaskDocument({
        status: 'completed',
        questionIndex: 0,
      })
      const gameDoc = createMockGameDocument({
        currentTask: task,
        _id: 'game-1',
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      gameAnswerRepository.findAllAnswersByGameId.mockResolvedValue([
        { participantId: 'p1' } as any,
      ])
      gameAnswerRepository.clear.mockRejectedValue(
        new Error('Repository clear failed'),
      )

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await expect(callback!(gameDoc as never)).rejects.toThrow(
        'Repository clear failed',
      )

      expect(buildQuestionResultTask).not.toHaveBeenCalled()
      expect(gameDoc.previousTasks).not.toContain(task)
    })

    it('question completed: propagates deserialization failure from repository and does not clear or transition', async () => {
      const task = createMockQuestionTaskDocument({
        status: 'completed',
        questionIndex: 0,
      })
      const gameDoc = createMockGameDocument({
        currentTask: task,
        _id: 'game-1',
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      gameAnswerRepository.findAllAnswersByGameId.mockRejectedValue(
        new Error('Invalid JSON stored for game game-1 answers'),
      )

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await expect(callback!(gameDoc as never)).rejects.toThrow(
        'Invalid JSON stored for game game-1 answers',
      )

      expect(gameAnswerRepository.clear).not.toHaveBeenCalled()
      expect(buildQuestionResultTask).not.toHaveBeenCalled()
      expect(gameDoc.previousTasks).not.toContain(task)
    })

    it('question result completed: propagates game result service failure when last question and players exist', async () => {
      const task = createMockQuestionResultTaskDocument({ status: 'completed' })
      const host = createMockGameHostParticipantDocument()
      const player = createMockGamePlayerParticipantDocument()

      const gameDoc = createMockGameDocument({
        currentTask: task,
        participants: [host, player],
        questions: [createMockMultiChoiceQuestionDocument()],
        nextQuestion: 1,
      })

      const leaderboardItems = [
        { participantId: 'p1', score: 10, rank: 1 },
      ] as any[]
      ;(updateParticipantsAndBuildLeaderboard as jest.Mock)
        .mockReset()
        .mockReturnValue(leaderboardItems as never)

      const podiumTask = createMockPodiumTaskDocument({ status: 'pending' })
      ;(buildPodiumTask as jest.Mock)
        .mockReset()
        .mockReturnValue(podiumTask as never)

      mockIsParticipantPlayer.mockImplementation((p: any) => p !== host)

      gameResultService.createGameResult.mockRejectedValue(
        new Error('Database error'),
      )

      const callback = service.getTaskTransitionCallback(gameDoc as never)
      expect(callback).toBeDefined()

      await expect(callback!(gameDoc as never)).rejects.toThrow(
        'Database error',
      )
    })
  })
})
