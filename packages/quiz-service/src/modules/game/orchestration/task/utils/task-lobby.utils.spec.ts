import { TaskType } from '../../../repositories/models/schemas'

import { buildLobbyTask } from './task-lobby.utils'

describe('Task Lobby Utils', () => {
  describe('buildLobbyTask', () => {
    it('creates a lobby task with required properties', () => {
      const task = buildLobbyTask()

      expect(task).toHaveProperty('_id')
      expect(task).toHaveProperty('type', TaskType.Lobby)
      expect(task).toHaveProperty('status', 'pending')
      expect(task).toHaveProperty('created')
    })

    it('generates a unique UUID for _id', () => {
      const task1 = buildLobbyTask()
      const task2 = buildLobbyTask()

      expect(task1._id).not.toEqual(task2._id)
      expect(typeof task1._id).toBe('string')
    })

    it('sets created to a valid Date instance', () => {
      const task = buildLobbyTask()

      expect(task.created instanceof Date).toBe(true)
      expect(isNaN(task.created.getTime())).toBe(false)
    })
  })
})
