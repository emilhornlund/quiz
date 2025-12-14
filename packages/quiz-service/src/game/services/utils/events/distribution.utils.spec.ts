import {
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'

import type {
  QuestionMultiChoiceWithBase,
  QuestionPinWithBase,
  QuestionPuzzleWithBase,
  QuestionRangeWithBase,
} from '../../../../modules/quiz/repositories/models/schemas'
import type {
  QuestionResultTaskCorrectAnswer,
  QuestionResultTaskItem,
} from '../../../repositories/models/schemas'

import {
  createMultiChoiceQuestionResultDistribution,
  createPinQuestionResultDistribution,
  createPuzzleQuestionResultDistribution,
  createRangeQuestionResultDistribution,
  createTrueFalseQuestionResultDistribution,
  createTypeAnswerQuestionResultDistribution,
} from './distribution.utils'

describe('distribution', () => {
  describe('createMultiChoiceQuestionResultDistribution', () => {
    const mockQuestion: QuestionMultiChoiceWithBase = {
      type: QuestionType.MultiChoice,
      text: 'Test question',
      points: 100,
      duration: 30,
      options: [
        { value: 'Option A', correct: false },
        { value: 'Option B', correct: true },
        { value: 'Option C', correct: false },
        { value: 'Option D', correct: true },
      ],
    }

    it('should return correct type', () => {
      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        [],
        [],
      )
      expect(result.type).toBe(QuestionType.MultiChoice)
    })

    it('should include correct answers with zero count when no results', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.MultiChoice, index: 1 },
        { type: QuestionType.MultiChoice, index: 3 },
      ]
      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0]).toEqual({
        value: 'Option B',
        count: 0,
        correct: true,
        index: 1,
      })
      expect(result.distribution[1]).toEqual({
        value: 'Option D',
        count: 0,
        correct: true,
        index: 3,
      })
    })

    it('should count player answers correctly', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.MultiChoice,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 1,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 1,
        },
        {
          type: QuestionType.MultiChoice,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player2',
            created: new Date(),
            answer: 0,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.MultiChoice,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player3',
            created: new Date(),
            answer: 1,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 2,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.MultiChoice, index: 1 },
        { type: QuestionType.MultiChoice, index: 3 },
      ]

      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(3)
      expect(result.distribution[0]).toEqual({
        value: 'Option B',
        count: 2,
        correct: true,
        index: 1,
      })
      expect(result.distribution[1]).toEqual({
        value: 'Option D',
        count: 0,
        correct: true,
        index: 3,
      })
      expect(result.distribution[2]).toEqual({
        value: 'Option A',
        count: 1,
        correct: false,
        index: 0,
      })
    })

    it('should ignore invalid option indices', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.MultiChoice,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: -1,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.MultiChoice,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player2',
            created: new Date(),
            answer: 10,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.MultiChoice, index: 1 },
      ]

      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 'Option B',
        count: 0,
        correct: true,
        index: 1,
      })
    })

    it('should ignore non-MultiChoice answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.MultiChoice,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Range,
            playerId: 'player1',
            created: new Date(),
            answer: 50,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.MultiChoice, index: 1 },
      ]

      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 'Option B',
        count: 0,
        correct: true,
        index: 1,
      })
    })

    it('should sort distribution correctly: correct answers first, then by count, then by index', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.MultiChoice,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 0,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.MultiChoice,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player2',
            created: new Date(),
            answer: 2,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.MultiChoice,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player3',
            created: new Date(),
            answer: 2,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 3,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.MultiChoice, index: 1 },
        { type: QuestionType.MultiChoice, index: 3 },
      ]

      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(4)
      // Correct answers first (index 1, then 3)
      expect(result.distribution[0].correct).toBe(true)
      expect(
        'index' in result.distribution[0] ? result.distribution[0].index : -1,
      ).toBe(1)
      expect(result.distribution[1].correct).toBe(true)
      expect(
        'index' in result.distribution[1] ? result.distribution[1].index : -1,
      ).toBe(3)
      // Then incorrect answers sorted by count (2, then 1), then by index
      expect(result.distribution[2].count).toBe(2)
      expect(
        'index' in result.distribution[2] ? result.distribution[2].index : -1,
      ).toBe(2)
      expect(result.distribution[3].count).toBe(1)
      expect(
        'index' in result.distribution[3] ? result.distribution[3].index : -1,
      ).toBe(0)
    })

    it('should handle correct answers with invalid indices', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.MultiChoice, index: -1 },
        { type: QuestionType.MultiChoice, index: 10 },
        { type: QuestionType.MultiChoice, index: 1 },
      ]

      const result = createMultiChoiceQuestionResultDistribution(
        mockQuestion,
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 'Option B',
        count: 0,
        correct: true,
        index: 1,
      })
    })
  })

  describe('createRangeQuestionResultDistribution', () => {
    const mockQuestion: QuestionRangeWithBase = {
      type: QuestionType.Range,
      text: 'Test range question',
      points: 100,
      duration: 30,
      min: 0,
      max: 100,
      step: 1,
      margin: QuestionRangeAnswerMargin.None,
      correct: 75,
    }

    it('should return correct type', () => {
      const result = createRangeQuestionResultDistribution(mockQuestion, [], [])
      expect(result.type).toBe(QuestionType.Range)
    })

    it('should include correct answer with zero count when no results', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Range, value: 75 },
      ]
      const result = createRangeQuestionResultDistribution(
        mockQuestion,
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 75,
        count: 0,
        correct: true,
      })
    })

    it('should count player answers correctly', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Range,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Range,
            playerId: 'player1',
            created: new Date(),
            answer: 75,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 1,
        },
        {
          type: QuestionType.Range,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Range,
            playerId: 'player2',
            created: new Date(),
            answer: 50,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Range,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Range,
            playerId: 'player3',
            created: new Date(),
            answer: 75,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 2,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Range, value: 75 },
      ]

      const result = createRangeQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0]).toEqual({
        value: 75,
        count: 2,
        correct: true,
      })
      expect(result.distribution[1]).toEqual({
        value: 50,
        count: 1,
        correct: false,
      })
    })

    it('should ignore answers outside range bounds', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Range,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Range,
            playerId: 'player1',
            created: new Date(),
            answer: -10,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Range,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Range,
            playerId: 'player2',
            created: new Date(),
            answer: 150,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Range, value: 75 },
      ]

      const result = createRangeQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 75,
        count: 0,
        correct: true,
      })
    })

    it('should ignore non-Range answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Range,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 1,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Range, value: 75 },
      ]

      const result = createRangeQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 75,
        count: 0,
        correct: true,
      })
    })

    it('should sort distribution correctly: correct answers first, then by count', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Range,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Range,
            playerId: 'player1',
            created: new Date(),
            answer: 25,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Range,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Range,
            playerId: 'player2',
            created: new Date(),
            answer: 25,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Range,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Range,
            playerId: 'player3',
            created: new Date(),
            answer: 50,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 3,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Range, value: 75 },
      ]

      const result = createRangeQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(3)
      expect(result.distribution[0].correct).toBe(true)
      expect(result.distribution[0].value).toBe(75)
      expect(result.distribution[1].count).toBe(2)
      expect(result.distribution[1].value).toBe(25)
      expect(result.distribution[2].count).toBe(1)
      expect(result.distribution[2].value).toBe(50)
    })
  })

  describe('createTrueFalseQuestionResultDistribution', () => {
    it('should return correct type', () => {
      const result = createTrueFalseQuestionResultDistribution([], [])
      expect(result.type).toBe(QuestionType.TrueFalse)
    })

    it('should include correct answer with zero count when no results', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TrueFalse, value: true },
      ]
      const result = createTrueFalseQuestionResultDistribution(
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: true,
        count: 0,
        correct: true,
      })
    })

    it('should count player answers correctly', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TrueFalse,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.TrueFalse,
            playerId: 'player1',
            created: new Date(),
            answer: true,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 1,
        },
        {
          type: QuestionType.TrueFalse,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.TrueFalse,
            playerId: 'player2',
            created: new Date(),
            answer: false,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.TrueFalse,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.TrueFalse,
            playerId: 'player3',
            created: new Date(),
            answer: true,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 2,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TrueFalse, value: true },
      ]

      const result = createTrueFalseQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0]).toEqual({
        value: true,
        count: 2,
        correct: true,
      })
      expect(result.distribution[1]).toEqual({
        value: false,
        count: 1,
        correct: false,
      })
    })

    it('should ignore non-TrueFalse answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TrueFalse,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 1,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TrueFalse, value: true },
      ]

      const result = createTrueFalseQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: true,
        count: 0,
        correct: true,
      })
    })

    it('should sort distribution correctly: correct answers first, then by count', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TrueFalse,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.TrueFalse,
            playerId: 'player1',
            created: new Date(),
            answer: false,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.TrueFalse,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.TrueFalse,
            playerId: 'player2',
            created: new Date(),
            answer: false,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.TrueFalse,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.TrueFalse,
            playerId: 'player3',
            created: new Date(),
            answer: true,
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 3,
          streak: 1,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TrueFalse, value: true },
      ]

      const result = createTrueFalseQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0].correct).toBe(true)
      expect(result.distribution[0].value).toBe(true)
      expect(result.distribution[1].correct).toBe(false)
      expect(result.distribution[1].value).toBe(false)
    })
  })

  describe('createTypeAnswerQuestionResultDistribution', () => {
    it('should return correct type', () => {
      const result = createTypeAnswerQuestionResultDistribution([], [])
      expect(result.type).toBe(QuestionType.TypeAnswer)
    })

    it('should include correct answer with zero count when no results', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TypeAnswer, value: 'Correct Answer' },
      ]
      const result = createTypeAnswerQuestionResultDistribution(
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 'correct answer',
        count: 0,
        correct: true,
      })
    })

    it('should count player answers correctly with case normalization', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player1',
            created: new Date(),
            answer: 'Correct Answer',
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 1,
        },
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player2',
            created: new Date(),
            answer: 'wrong answer',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player3',
            created: new Date(),
            answer: 'CORRECT ANSWER',
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 2,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TypeAnswer, value: 'Correct Answer' },
      ]

      const result = createTypeAnswerQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0]).toEqual({
        value: 'correct answer',
        count: 2,
        correct: true,
      })
      expect(result.distribution[1]).toEqual({
        value: 'wrong answer',
        count: 1,
        correct: false,
      })
    })

    it('should ignore empty answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player1',
            created: new Date(),
            answer: '',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TypeAnswer, value: 'Correct Answer' },
      ]

      const result = createTypeAnswerQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 'correct answer',
        count: 0,
        correct: true,
      })
    })

    it('should ignore non-TypeAnswer answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 1,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TypeAnswer, value: 'Correct Answer' },
      ]

      const result = createTypeAnswerQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: 'correct answer',
        count: 0,
        correct: true,
      })
    })

    it('should sort distribution correctly: correct answers first, then by count', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player1',
            created: new Date(),
            answer: 'wrong',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player2',
            created: new Date(),
            answer: 'wrong',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.TypeAnswer,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.TypeAnswer,
            playerId: 'player3',
            created: new Date(),
            answer: 'correct',
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 3,
          streak: 1,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.TypeAnswer, value: 'correct' },
      ]

      const result = createTypeAnswerQuestionResultDistribution(
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0].correct).toBe(true)
      expect(result.distribution[0].value).toBe('correct')
      expect(result.distribution[1].correct).toBe(false)
      expect(result.distribution[1].value).toBe('wrong')
    })
  })

  describe('createPinQuestionResultDistribution', () => {
    const mockQuestion: QuestionPinWithBase = {
      type: QuestionType.Pin,
      text: 'Test pin question',
      points: 100,
      duration: 30,
      imageURL: 'https://example.com/image.jpg',
      positionX: 0.5,
      positionY: 0.5,
      tolerance: QuestionPinTolerance.Medium,
    }

    it('should return correct type and metadata', () => {
      const result = createPinQuestionResultDistribution(mockQuestion, [], [])
      expect(result.type).toBe(QuestionType.Pin)
      const pinResult = result as {
        imageURL: string
        positionX: number
        positionY: number
        tolerance: QuestionPinTolerance
      }
      expect(pinResult.imageURL).toBe('https://example.com/image.jpg')
      expect(pinResult.positionX).toBe(0.5)
      expect(pinResult.positionY).toBe(0.5)
      expect(pinResult.tolerance).toBe(QuestionPinTolerance.Medium)
    })

    it('should include correct answer with zero count when no results', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Pin, value: '0.5,0.5' },
      ]
      const result = createPinQuestionResultDistribution(
        mockQuestion,
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: '0.5,0.5',
        count: 0,
        correct: true,
      })
    })

    it('should count player answers correctly', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Pin,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player1',
            created: new Date(),
            answer: '0.5,0.5',
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 1,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player2',
            created: new Date(),
            answer: '0.25,0.25',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player3',
            created: new Date(),
            answer: '0.5,0.5',
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 2,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Pin, value: '0.5,0.5' },
      ]

      const result = createPinQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0]).toEqual({
        value: '0.5,0.5',
        count: 2,
        correct: true,
      })
      expect(result.distribution[1]).toEqual({
        value: '0.25,0.25',
        count: 1,
        correct: false,
      })
    })

    it('should ignore invalid coordinate formats', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Pin,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player1',
            created: new Date(),
            answer: 'invalid',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player2',
            created: new Date(),
            answer: '1.5,0.5',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player3',
            created: new Date(),
            answer: '-0.5,0.5',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 3,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Pin, value: '0.5,0.5' },
      ]

      const result = createPinQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: '0.5,0.5',
        count: 0,
        correct: true,
      })
    })

    it('should accept valid normalized coordinates', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Pin,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player1',
            created: new Date(),
            answer: '0,0',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player2',
            created: new Date(),
            answer: '1,1',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player3',
            created: new Date(),
            answer: '0.5,0.25',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 3,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Pin, value: '0.5,0.5' },
      ]

      const result = createPinQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(4)
      expect(result.distribution[0].value).toBe('0.5,0.5')
      expect(result.distribution[1].value).toBe('0,0')
      expect(result.distribution[2].value).toBe('1,1')
      expect(result.distribution[3].value).toBe('0.5,0.25')
    })

    it('should ignore non-Pin answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Pin,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 1,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Pin, value: '0.5,0.5' },
      ]

      const result = createPinQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: '0.5,0.5',
        count: 0,
        correct: true,
      })
    })

    it('should sort distribution correctly: correct answers first, then by count', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Pin,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player1',
            created: new Date(),
            answer: '0.25,0.25',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player2',
            created: new Date(),
            answer: '0.25,0.25',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Pin,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Pin,
            playerId: 'player3',
            created: new Date(),
            answer: '0.75,0.75',
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 3,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Pin, value: '0.5,0.5' },
      ]

      const result = createPinQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(3)
      expect(result.distribution[0].correct).toBe(true)
      expect(result.distribution[0].value).toBe('0.5,0.5')
      expect(result.distribution[1].count).toBe(2)
      expect(result.distribution[1].value).toBe('0.25,0.25')
      expect(result.distribution[2].count).toBe(1)
      expect(result.distribution[2].value).toBe('0.75,0.75')
    })
  })

  describe('createPuzzleQuestionResultDistribution', () => {
    const mockQuestion: QuestionPuzzleWithBase = {
      type: QuestionType.Puzzle,
      text: 'Test puzzle question',
      points: 100,
      duration: 30,
      values: ['A', 'B', 'C', 'D'],
    }

    it('should return correct type and values', () => {
      const result = createPuzzleQuestionResultDistribution(
        mockQuestion,
        [],
        [],
      )
      expect(result.type).toBe(QuestionType.Puzzle)
      const puzzleResult = result as { values: string[] }
      expect(puzzleResult.values).toEqual(['A', 'B', 'C', 'D'])
    })

    it('should include correct answer with zero count when no results', () => {
      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
      ]
      const result = createPuzzleQuestionResultDistribution(
        mockQuestion,
        [],
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: ['A', 'B', 'C', 'D'],
        count: 0,
        correct: true,
      })
    })

    it('should count player answers correctly using arraysEqual', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Puzzle,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player1',
            created: new Date(),
            answer: ['A', 'B', 'C', 'D'],
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 1,
        },
        {
          type: QuestionType.Puzzle,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player2',
            created: new Date(),
            answer: ['D', 'C', 'B', 'A'],
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Puzzle,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player3',
            created: new Date(),
            answer: ['A', 'B', 'C', 'D'],
          },
          correct: true,
          lastScore: 100,
          totalScore: 100,
          position: 1,
          streak: 2,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
      ]

      const result = createPuzzleQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(2)
      expect(result.distribution[0]).toEqual({
        value: ['A', 'B', 'C', 'D'],
        count: 2,
        correct: true,
      })
      expect(result.distribution[1]).toEqual({
        value: ['D', 'C', 'B', 'A'],
        count: 1,
        correct: false,
      })
    })

    it('should ignore non-array answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Puzzle,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player1',
            created: new Date(),
            answer: null,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Puzzle,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player2',
            created: new Date(),
            answer: 'not an array' as unknown as string[],
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
      ]

      const result = createPuzzleQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: ['A', 'B', 'C', 'D'],
        count: 0,
        correct: true,
      })
    })

    it('should ignore non-Puzzle answers', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Puzzle,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.MultiChoice,
            playerId: 'player1',
            created: new Date(),
            answer: 1,
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
      ]

      const result = createPuzzleQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(1)
      expect(result.distribution[0]).toEqual({
        value: ['A', 'B', 'C', 'D'],
        count: 0,
        correct: true,
      })
    })

    it('should sort distribution correctly: correct answers first, then by count', () => {
      const results: QuestionResultTaskItem[] = [
        {
          type: QuestionType.Puzzle,
          playerId: 'player1',
          nickname: 'Player 1',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player1',
            created: new Date(),
            answer: ['D', 'C', 'B', 'A'],
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 1,
          streak: 0,
        },
        {
          type: QuestionType.Puzzle,
          playerId: 'player2',
          nickname: 'Player 2',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player2',
            created: new Date(),
            answer: ['D', 'C', 'B', 'A'],
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 2,
          streak: 0,
        },
        {
          type: QuestionType.Puzzle,
          playerId: 'player3',
          nickname: 'Player 3',
          answer: {
            type: QuestionType.Puzzle,
            playerId: 'player3',
            created: new Date(),
            answer: ['B', 'A', 'D', 'C'],
          },
          correct: false,
          lastScore: 0,
          totalScore: 0,
          position: 3,
          streak: 0,
        },
      ]

      const correctAnswers: QuestionResultTaskCorrectAnswer[] = [
        { type: QuestionType.Puzzle, value: ['A', 'B', 'C', 'D'] },
      ]

      const result = createPuzzleQuestionResultDistribution(
        mockQuestion,
        results,
        correctAnswers,
      )

      expect(result.distribution).toHaveLength(3)
      expect(result.distribution[0].correct).toBe(true)
      expect(result.distribution[0].value).toEqual(['A', 'B', 'C', 'D'])
      expect(result.distribution[1].count).toBe(2)
      expect(result.distribution[1].value).toEqual(['D', 'C', 'B', 'A'])
      expect(result.distribution[2].count).toBe(1)
      expect(result.distribution[2].value).toEqual(['B', 'A', 'D', 'C'])
    })
  })
})
