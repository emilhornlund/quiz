import { QuestionType } from '@quiz/common'

import {
  createMockGameDocument,
  createMockMultiChoiceQuestionDocument,
  createMockPinQuestionDocument,
  createMockPuzzleQuestionDocument,
  createMockRangeQuestionDocument,
  createMockTrueFalseQuestionDocument,
  createMockTypeAnswerQuestionDocument,
} from '../../../../../test-utils/data'
import {
  QuestionTaskBaseMetadata,
  QuestionTaskPuzzleMetadata,
  TaskType,
} from '../../../repositories/models/schemas'

import { buildQuestionTask } from './task-question.utils'

describe('Task Question Utils', () => {
  describe('buildQuestionTask', () => {
    it('creates a Question task with MultiChoice metadata', () => {
      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [createMockMultiChoiceQuestionDocument()],
      })

      const result = buildQuestionTask(game as never)

      expect(result.type).toBe(TaskType.Question)
      expect(result.metadata.type).toBe(QuestionType.MultiChoice)
    })

    it('creates a Question task with Range metadata', () => {
      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [createMockRangeQuestionDocument()],
      })

      const result = buildQuestionTask(game as never)

      expect(result.metadata.type).toBe(QuestionType.Range)
    })

    it('creates a Question task with TrueFalse metadata', () => {
      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [createMockTrueFalseQuestionDocument()],
      })

      const result = buildQuestionTask(game as never)

      expect(result.metadata.type).toBe(QuestionType.TrueFalse)
    })

    it('creates a Question task with TypeAnswer metadata', () => {
      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [createMockTypeAnswerQuestionDocument()],
      })

      const result = buildQuestionTask(game as never)

      expect(result.metadata.type).toBe(QuestionType.TypeAnswer)
    })

    it('creates a Question task with Pin metadata', () => {
      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [createMockPinQuestionDocument()],
      })

      const result = buildQuestionTask(game as never)

      expect(result.metadata.type).toBe(QuestionType.Pin)
    })

    it('creates a Question task with Puzzle metadata and randomized values', () => {
      const puzzleQuestion = createMockPuzzleQuestionDocument()

      const game = createMockGameDocument({
        nextQuestion: 0,
        questions: [puzzleQuestion],
      })

      const result = buildQuestionTask(game as never)

      const metadata = result.metadata as QuestionTaskBaseMetadata &
        QuestionTaskPuzzleMetadata

      expect(metadata.type).toBe(QuestionType.Puzzle)

      expect(metadata.randomizedValues).toBeDefined()
      expect(metadata.randomizedValues.length).toBe(
        puzzleQuestion.values.length,
      )

      expect(metadata.randomizedValues).not.toEqual(puzzleQuestion.values)

      expect(new Set(metadata.randomizedValues)).toEqual(
        new Set(puzzleQuestion.values),
      )
    })
  })
})
