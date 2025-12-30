import { v4 as uuidv4 } from 'uuid'

import {
  createMockGameDocument,
  createMockGamePlayerParticipantDocument,
  createMockLeaderboardTaskDocument,
  createMockPodiumTaskDocument,
  createMockQuestionResultTaskDocument,
  createMockQuestionResultTaskItemDocument,
  createMockQuestionTaskDocument,
} from '../../../../test-utils/data'
import { TaskType } from '../../game-core/repositories/models/schemas'

import {
  findLastQuestionResultTask,
  findPreviousQuestionResultForPlayer,
  findQuestionResultForPlayer,
} from './question-result.utils'

describe('Question Result Utils', () => {
  describe('findQuestionResultForPlayer', () => {
    it('returns the matching result entry for the given player', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const expectedResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [expectedResult],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBe(expectedResult)
    })

    it('returns the correct result when multiple results exist', () => {
      const playerId = uuidv4()
      const otherPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const otherResult = createMockQuestionResultTaskItemDocument({
        playerId: otherPlayerId,
      })
      const expectedResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })
      const anotherResult = createMockQuestionResultTaskItemDocument({
        playerId: uuidv4(),
      })

      const task = createMockQuestionResultTaskDocument({
        results: [otherResult, expectedResult, anotherResult],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBe(expectedResult)
    })

    it('returns null when there is no result entry for the player', () => {
      const playerId = uuidv4()
      const otherPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [
          createMockQuestionResultTaskItemDocument({
            playerId: otherPlayerId,
          }),
        ],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })

    it('returns null when the results list is empty', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })
  })

  describe('findPreviousQuestionResultForPlayer', () => {
    it('returns the previous result entry when the player is not first in the list', () => {
      const playerId = uuidv4()
      const previousPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const previousResult = createMockQuestionResultTaskItemDocument({
        playerId: previousPlayerId,
      })
      const currentResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [previousResult, currentResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBe(previousResult)
    })

    it('returns the immediate previous result when there are multiple earlier entries', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const firstResult = createMockQuestionResultTaskItemDocument({
        playerId: uuidv4(),
      })
      const secondResult = createMockQuestionResultTaskItemDocument({
        playerId: uuidv4(),
      })
      const currentResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [firstResult, secondResult, currentResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBe(secondResult)
    })

    it('returns null when the player is the first entry in the results list', () => {
      const playerId = uuidv4()
      const otherPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const firstResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })
      const secondResult = createMockQuestionResultTaskItemDocument({
        playerId: otherPlayerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [firstResult, secondResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })

    it('returns null when there is no result entry for the player', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [
          createMockQuestionResultTaskItemDocument({
            playerId: uuidv4(),
          }),
          createMockQuestionResultTaskItemDocument({
            playerId: uuidv4(),
          }),
        ],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })

    it('returns null when the results list has fewer than two entries', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const onlyResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [onlyResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })
  })

  describe('findLastQuestionResultTask', () => {
    it('returns the current task when it is a QuestionResultTask', () => {
      const currentTask = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask,
        previousTasks: [
          createMockQuestionTaskDocument(),
          createMockLeaderboardTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(currentTask)
    })

    it('returns the last QuestionResult task from previousTasks when currentTask is not QuestionResult', () => {
      const expected = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument(),
        previousTasks: [
          createMockQuestionResultTaskDocument(),
          createMockLeaderboardTaskDocument(),
          createMockQuestionTaskDocument(),
          expected,
          createMockPodiumTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(expected)
      expect(result?.type).toBe(TaskType.QuestionResult)
    })

    it('prefers current QuestionResult task over any previous QuestionResult tasks', () => {
      const previousQuestionResult = createMockQuestionResultTaskDocument()
      const currentTask = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask,
        previousTasks: [
          createMockQuestionTaskDocument(),
          previousQuestionResult,
          createMockLeaderboardTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(currentTask)
    })

    it('returns null when neither currentTask nor previousTasks contain a QuestionResult task', () => {
      const game = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument(),
        previousTasks: [
          createMockLeaderboardTaskDocument(),
          createMockPodiumTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBeNull()
    })

    it('returns null when previousTasks is empty and currentTask is not a QuestionResult task', () => {
      const game = createMockGameDocument({
        currentTask: createMockLeaderboardTaskDocument(),
        previousTasks: [],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBeNull()
    })

    it('returns the only QuestionResult task in previousTasks when currentTask is not QuestionResult', () => {
      const expected = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask: createMockPodiumTaskDocument(),
        previousTasks: [expected],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(expected)
    })

    it('does not mutate the order of previousTasks when searching for the last QuestionResult task', () => {
      const previousTasks = [
        createMockQuestionTaskDocument(),
        createMockQuestionResultTaskDocument(),
        createMockLeaderboardTaskDocument(),
        createMockQuestionResultTaskDocument(),
      ]

      const game = createMockGameDocument({
        currentTask: createMockPodiumTaskDocument(),
        previousTasks: [...previousTasks],
      })

      findLastQuestionResultTask(game as never)

      expect(game.previousTasks).toEqual(previousTasks)
    })
  })
})
