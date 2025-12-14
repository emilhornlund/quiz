import { TaskType } from '../../../repositories/models/schemas'

import { buildQuitTask } from './task-quit.utils'

describe('Task Quit Utils', () => {
  describe('buildQuitTask', () => {
    it('creates a quit task with required properties', () => {
      const task = buildQuitTask()

      expect(task).toHaveProperty('_id')
      expect(task).toHaveProperty('type', TaskType.Quit)
      expect(task).toHaveProperty('status', 'completed')
      expect(task).toHaveProperty('created')
    })

    it('generates a unique UUID for _id', () => {
      const task1 = buildQuitTask()
      const task2 = buildQuitTask()

      expect(task1._id).not.toEqual(task2._id)
      expect(typeof task1._id).toBe('string')
    })

    it('sets created to a valid Date instance', () => {
      const task = buildQuitTask()

      expect(task.created instanceof Date).toBe(true)
      expect(isNaN(task.created.getTime())).toBe(false)
    })
  })
})
