import { QuestionType } from '@klurigo/common'

import {
  toPlayerQuestionPlayerEventMetaData,
  toQuestionTaskAnswer,
} from './game-event.utils'

describe('game-event.utils', () => {
  describe('toQuestionTaskAnswer', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-01T10:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('builds MultiChoice answer from optionIndex', () => {
      const result = toQuestionTaskAnswer('p1', {
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
      const result = toQuestionTaskAnswer('p1', {
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
      const result = toQuestionTaskAnswer('p1', {
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
      const result = toQuestionTaskAnswer('p1', {
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
      const result = toQuestionTaskAnswer('p1', {
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
      const result = toQuestionTaskAnswer('p1', {
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

      const meta = toPlayerQuestionPlayerEventMetaData(answers, {
        participantId: 'p2',
      } as never)

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

      const meta = toPlayerQuestionPlayerEventMetaData(answers, {
        participantId: 'p2',
      } as never)

      expect(meta).toEqual({
        playerAnswerSubmission: undefined,
      })
    })
  })
})
