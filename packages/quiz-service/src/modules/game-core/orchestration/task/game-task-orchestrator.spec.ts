import {
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockGamePlayerParticipantDocument,
  createMockLobbyTaskDocument,
  createMockMultiChoiceQuestionDocument,
  createMockQuestionResultTaskDocument,
  createMockQuestionTaskDocument,
} from '../../../../../test-utils/data'
import { IllegalTaskTypeException } from '../../exceptions'

import { GameTaskOrchestrator } from './game-task-orchestrator'

describe('GameTaskOrchestrator', () => {
  let orchestrator: GameTaskOrchestrator

  beforeEach(() => {
    orchestrator = new GameTaskOrchestrator()
  })

  describe('buildLobbyTask', () => {
    it('should create a lobby task with required properties', () => {
      const result = orchestrator.buildLobbyTask()

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'LOBBY')
      expect(result).toHaveProperty('status', 'pending')
      expect(result).toHaveProperty('created')
    })

    it('should generate unique IDs for different lobby tasks', () => {
      const task1 = orchestrator.buildLobbyTask()
      const task2 = orchestrator.buildLobbyTask()

      expect(task1._id).not.toEqual(task2._id)
      expect(typeof task1._id).toBe('string')
    })
  })

  describe('buildQuestionTask', () => {
    it('should build a question task from valid game document', () => {
      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockLobbyTaskDocument(),
      })

      const result = orchestrator.buildQuestionTask(game as never)

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'QUESTION')
      expect(result).toHaveProperty('status', 'pending')
      expect(result).toHaveProperty('created')
      expect(result).toHaveProperty('metadata')
    })

    it('should handle game document with multiple questions', () => {
      const game = createMockGameDocument({
        nextQuestion: 1,
        questions: [
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
        ],
        currentTask: createMockLobbyTaskDocument(),
      })

      const result = orchestrator.buildQuestionTask(game as never)

      expect(result.metadata).toBeDefined()
    })
  })

  describe('buildQuestionResultTask', () => {
    it('should build question result task from game with question task', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionTaskDocument(),
        participants: [
          createMockGamePlayerParticipantDocument(),
          createMockGameHostParticipantDocument(),
        ],
      })

      const result = orchestrator.buildQuestionResultTask(game as never)

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'QUESTION_RESULT')
      expect(result).toHaveProperty('status', 'pending')
      expect(result).toHaveProperty('created')
      expect(result).toHaveProperty('correctAnswers')
      expect(result).toHaveProperty('results')
    })

    it('should throw IllegalTaskTypeException when current task is not question', () => {
      const game = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument(),
      })

      expect(() => orchestrator.buildQuestionResultTask(game as never)).toThrow(
        IllegalTaskTypeException,
      )
    })

    it('should handle game with no participants', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionTaskDocument(),
        participants: [],
      })

      const result = orchestrator.buildQuestionResultTask(game as never)

      expect(result.results).toEqual([])
    })
  })

  describe('rebuildQuestionResultTask', () => {
    it('should rebuild question result task from game document', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
        previousTasks: [createMockQuestionTaskDocument()],
      })

      const result = orchestrator.rebuildQuestionResultTask(game as never)

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'QUESTION_RESULT')
      expect(result).toHaveProperty('status', 'pending')
      expect(result).toHaveProperty('created')
      expect(result).toHaveProperty('correctAnswers')
      expect(result).toHaveProperty('results')
    })

    it('should throw IllegalTaskTypeException when current task is not question-result', () => {
      const game = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument(),
        previousTasks: [createMockQuestionTaskDocument()],
      })

      expect(() =>
        orchestrator.rebuildQuestionResultTask(game as never),
      ).toThrow(IllegalTaskTypeException)
    })

    it('should throw IllegalTaskTypeException when previous task is not question', () => {
      const game = createMockGameDocument({
        currentTask: createMockQuestionResultTaskDocument(),
        previousTasks: [createMockLobbyTaskDocument()],
      })

      expect(() =>
        orchestrator.rebuildQuestionResultTask(game as never),
      ).toThrow(IllegalTaskTypeException)
    })

    it('should throw IllegalTaskTypeException when no previous tasks exist', () => {
      const game = createMockGameDocument({
        currentTask: createMockQuestionResultTaskDocument(),
        previousTasks: [],
      })

      expect(() =>
        orchestrator.rebuildQuestionResultTask(game as never),
      ).toThrow(IllegalTaskTypeException)
    })
  })

  describe('updateParticipantsAndBuildLeaderboard', () => {
    it('should update participants and build leaderboard from question result task', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
        participants: [
          createMockGamePlayerParticipantDocument(),
          createMockGameHostParticipantDocument(),
        ],
      })

      const result = orchestrator.updateParticipantsAndBuildLeaderboard(
        game as never,
      )

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty participants list', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
        participants: [],
      })

      const result = orchestrator.updateParticipantsAndBuildLeaderboard(
        game as never,
      )

      expect(result).toEqual([])
    })
  })

  describe('buildLeaderboardTask', () => {
    it('should build leaderboard task from game document and leaderboard items', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
      })
      const leaderboardItems = [
        {
          participantId: 'player1',
          nickname: 'Player 1',
          score: 100,
          rank: 1,
        },
      ] as any

      const result = orchestrator.buildLeaderboardTask(
        game as never,
        leaderboardItems,
      )

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'LEADERBOARD')
      expect(result).toHaveProperty('status', 'pending')
      expect(result).toHaveProperty('created')
      expect(result).toHaveProperty('leaderboard')
      expect(result.leaderboard).toEqual(leaderboardItems)
    })

    it('should throw IllegalTaskTypeException when current task is not question-result', () => {
      const game = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument(),
      })
      const leaderboardItems: any[] = []

      expect(() =>
        orchestrator.buildLeaderboardTask(game as never, leaderboardItems),
      ).toThrow(IllegalTaskTypeException)
    })

    it('should handle empty leaderboard items', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
      })

      const result = orchestrator.buildLeaderboardTask(game as never, [])

      expect(result.leaderboard).toEqual([])
    })
  })

  describe('buildPodiumTask', () => {
    it('should build podium task from game document and leaderboard items', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
      })
      const leaderboardItems = [
        {
          participantId: 'player1',
          nickname: 'Player 1',
          score: 100,
          rank: 1,
        },
      ] as any

      const result = orchestrator.buildPodiumTask(
        game as never,
        leaderboardItems,
      )

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'PODIUM')
      expect(result).toHaveProperty('status', 'pending')
      expect(result).toHaveProperty('created')
      expect(result).toHaveProperty('leaderboard')
      expect(result.leaderboard).toEqual(leaderboardItems)
    })

    it('should throw IllegalTaskTypeException when current task is not question-result', () => {
      const game = createMockGameDocument({
        currentTask: createMockLobbyTaskDocument(),
      })
      const leaderboardItems: any[] = []

      expect(() =>
        orchestrator.buildPodiumTask(game as never, leaderboardItems),
      ).toThrow(IllegalTaskTypeException)
    })

    it('should handle empty leaderboard items for podium', () => {
      const game = createMockGameDocument({
        questions: [createMockMultiChoiceQuestionDocument()],
        currentTask: createMockQuestionResultTaskDocument(),
      })

      const result = orchestrator.buildPodiumTask(game as never, [])

      expect(result.leaderboard).toEqual([])
    })
  })

  describe('buildQuitTask', () => {
    it('should create a quit task with required properties', () => {
      const result = orchestrator.buildQuitTask()

      expect(result).toHaveProperty('_id')
      expect(result).toHaveProperty('type', 'QUIT')
      expect(result).toHaveProperty('status', 'completed')
      expect(result).toHaveProperty('created')
    })

    it('should generate unique IDs for different quit tasks', () => {
      const task1 = orchestrator.buildQuitTask()
      const task2 = orchestrator.buildQuitTask()

      expect(task1._id).not.toEqual(task2._id)
      expect(typeof task1._id).toBe('string')
    })
  })
})
