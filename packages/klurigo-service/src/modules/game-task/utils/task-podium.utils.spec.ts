import { GameMode, QuestionType } from '@klurigo/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseTask,
  GameDocument,
  LeaderboardTaskItem,
  LobbyTask,
  QuestionResultTask,
  TaskType,
} from '../../game-core/repositories/models/schemas'
import { IllegalTaskTypeException } from '../exceptions'

import { buildPodiumTask } from './task-podium.utils'

describe('Task Podium Utils', () => {
  describe('buildPodiumTask', () => {
    it('throws IllegalTaskTypeException when current task is not QuestionResult', () => {
      const invalidTask: BaseTask & LobbyTask = {
        _id: uuidv4(),
        type: TaskType.Lobby,
        status: 'pending',
        created: new Date(),
      }

      const game = buildGameDocument({
        currentTask: invalidTask,
      })

      expect(() => buildPodiumTask(game, [])).toThrow(IllegalTaskTypeException)
    })

    it('creates a pending podium task with provided leaderboard', () => {
      const playerId1 = uuidv4()
      const playerId2 = uuidv4()

      const leaderboard: LeaderboardTaskItem[] = [
        {
          playerId: playerId1,
          nickname: 'Alice',
          position: 1,
          previousPosition: 2,
          score: 120,
          streaks: 4,
        },
        {
          playerId: playerId2,
          nickname: 'Bob',
          position: 2,
          previousPosition: 1,
          score: 100,
          streaks: 3,
        },
      ]

      const game = buildGameDocument()

      const task = buildPodiumTask(game, leaderboard)

      expect(task.type).toBe(TaskType.Podium)
      expect(task.status).toBe('pending')
      expect(task.leaderboard).toEqual(leaderboard)

      expect(task._id).toBeDefined()
      expect(typeof task._id).toBe('string')
      expect(task._id.length).toBeGreaterThan(0)

      expect(task.created).toBeInstanceOf(Date)
    })
  })
})

const buildQuestionResultTask = (
  overrides: Partial<QuestionResultTask> = {},
): BaseTask & QuestionResultTask => {
  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex: 0,
    correctAnswers: [{ type: QuestionType.Range, value: 0 }],
    results: [],
    created: new Date(),
    ...overrides,
  } as BaseTask & QuestionResultTask
}

const buildGameDocument = (
  overrides: Partial<GameDocument> = {},
): GameDocument => {
  return {
    _id: uuidv4(),
    mode: GameMode.Classic,
    participants: [],
    currentTask: buildQuestionResultTask(),
    previousTasks: [],
    created: new Date(),
    updated: new Date(),
    ...overrides,
  } as GameDocument
}
