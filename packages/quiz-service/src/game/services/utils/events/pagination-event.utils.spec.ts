import {
  createMockGameDocument,
  createMockMultiChoiceQuestionDocument,
  createMockQuestionResultTaskDocument,
} from '../../../../../test-utils/data'

import {
  buildPaginationEvent,
  buildPaginationEventFromGameDocument,
  buildPaginationEventFromQuestionResultTask,
} from './pagination-event.utils'

describe('Pagination Event Utils', () => {
  describe('buildPaginationEventFromGameDocument', () => {
    it('builds pagination from currentTask questionIndex (0 -> 1) and questions length', () => {
      const game = createMockGameDocument({
        currentTask: createMockQuestionResultTaskDocument({ questionIndex: 0 }),
        questions: [
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
        ],
      })

      const result = buildPaginationEventFromGameDocument(game as never)

      expect(result).toEqual({
        current: 1,
        total: 3,
      })
    })

    it('uses one-based index for non-zero questionIndex', () => {
      const game = createMockGameDocument({
        currentTask: createMockQuestionResultTaskDocument({ questionIndex: 2 }),
        questions: [
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
        ],
      })

      const result = buildPaginationEventFromGameDocument(game as never)

      expect(result).toEqual({
        current: 3,
        total: 3,
      })
    })
  })

  describe('buildPaginationEventFromQuestionResultTask', () => {
    it('builds pagination from questionResultTask questionIndex (0 -> 1) and questions length', () => {
      const game = createMockGameDocument({
        questions: [
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
        ],
      })

      const questionResultTask = createMockQuestionResultTaskDocument({
        questionIndex: 0,
      })

      const result = buildPaginationEventFromQuestionResultTask(
        game as never,
        questionResultTask,
      )

      expect(result).toEqual({
        current: 1,
        total: 3,
      })
    })

    it('uses one-based index from questionResultTask for non-zero questionIndex', () => {
      const game = createMockGameDocument({
        questions: [
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
          createMockMultiChoiceQuestionDocument(),
        ],
      })

      const questionResultTask = createMockQuestionResultTaskDocument({
        questionIndex: 2,
      })

      const result = buildPaginationEventFromQuestionResultTask(
        game as never,
        questionResultTask,
      )

      expect(result).toEqual({
        current: 3,
        total: 4,
      })
    })
  })

  describe('buildPaginationEvent', () => {
    it('returns pagination event with provided current and total', () => {
      const result = buildPaginationEvent(1, 20)

      expect(result).toEqual({
        current: 1,
        total: 20,
      })
    })

    it('supports edge cases such as current equal to total', () => {
      const result = buildPaginationEvent(10, 10)

      expect(result).toEqual({
        current: 10,
        total: 10,
      })
    })
  })
})
