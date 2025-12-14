import {
  validateAndGetQuestion,
  validateGameDocument,
} from './validation.utils'

describe('validation.utils', () => {
  describe('validateAndGetQuestion', () => {
    const mockQuestion = {
      type: 'MultiChoice' as const,
      text: 'Test question',
      points: 100,
      duration: 30,
      options: [
        { value: 'Option A', correct: false },
        { value: 'Option B', correct: true },
      ],
    }

    const createMockGame = (
      questions: any[] = [mockQuestion],
      questionIndex: number = 0,
    ) => ({
      _id: 'game123',
      name: 'Test Game',
      mode: 'Classic' as const,
      status: 'InProgress' as const,
      pin: '123456',
      questions,
      nextQuestion: 1,
      participants: [] as any[],
      currentTask: {
        _id: 'task123',
        type: 'QUESTION' as const,
        status: 'active' as const,
        created: new Date(),
        questionIndex,
      },
      previousTasks: [] as any[],
      updated: new Date(),
      created: new Date(),
    })

    it('should return the question when valid game and index', () => {
      const mockGame = createMockGame()
      const result = validateAndGetQuestion(mockGame as any)
      expect(result).toBe(mockQuestion)
    })

    it('should throw error when game has no questions', () => {
      const gameWithNoQuestions = createMockGame([])

      expect(() => validateAndGetQuestion(gameWithNoQuestions as any)).toThrow(
        'Game has no questions',
      )
    })

    it('should throw error when questions array is undefined', () => {
      const gameWithUndefinedQuestions = {
        ...createMockGame(),
        questions: undefined as any,
      }

      expect(() =>
        validateAndGetQuestion(gameWithUndefinedQuestions as any),
      ).toThrow('Game has no questions')
    })

    it('should throw error when questionIndex is negative', () => {
      const gameWithNegativeIndex = createMockGame([mockQuestion], -1)

      expect(() =>
        validateAndGetQuestion(gameWithNegativeIndex as any),
      ).toThrow(
        'Question index -1 is out of bounds. Game has 1 questions (0-0)',
      )
    })

    it('should throw error when questionIndex is equal to questions length', () => {
      const gameWithIndexAtLength = createMockGame([mockQuestion], 1)

      expect(() =>
        validateAndGetQuestion(gameWithIndexAtLength as any),
      ).toThrow('Question index 1 is out of bounds. Game has 1 questions (0-0)')
    })

    it('should throw error when questionIndex is greater than questions length', () => {
      const gameWithIndexBeyondLength = createMockGame([mockQuestion], 5)

      expect(() =>
        validateAndGetQuestion(gameWithIndexBeyondLength as any),
      ).toThrow('Question index 5 is out of bounds. Game has 1 questions (0-0)')
    })

    it('should work with multiple questions and valid index', () => {
      const mockQuestions = [
        mockQuestion,
        {
          ...mockQuestion,
          text: 'Second question',
        },
        {
          ...mockQuestion,
          text: 'Third question',
        },
      ]

      const gameWithMultipleQuestions = createMockGame(mockQuestions, 1)

      const result = validateAndGetQuestion(gameWithMultipleQuestions as any)
      expect(result).toBe(mockQuestions[1])
      expect(result.text).toBe('Second question')
    })

    it('should work with last valid index', () => {
      const mockQuestions = [
        mockQuestion,
        {
          ...mockQuestion,
          text: 'Second question',
        },
        {
          ...mockQuestion,
          text: 'Third question',
        },
      ]

      const gameWithLastIndex = createMockGame(mockQuestions, 2)

      const result = validateAndGetQuestion(gameWithLastIndex as any)
      expect(result).toBe(mockQuestions[2])
      expect(result.text).toBe('Third question')
    })

    it('should work with index 0 when there are many questions', () => {
      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        ...mockQuestion,
        text: `Question ${i}`,
      }))

      const gameWithZeroIndex = createMockGame(mockQuestions, 0)

      const result = validateAndGetQuestion(gameWithZeroIndex as any)
      expect(result).toBe(mockQuestions[0])
      expect(result.text).toBe('Question 0')
    })
  })

  describe('validateGameDocument', () => {
    const createMockGame = (overrides: any = {}) => ({
      _id: 'game123',
      name: 'Test Game',
      mode: 'Classic' as const,
      status: 'InProgress' as const,
      pin: '123456',
      questions: [],
      nextQuestion: 0,
      participants: [],
      currentTask: {
        _id: 'task123',
        type: 'LOBBY' as const,
        status: 'pending' as const,
        created: new Date(),
      },
      previousTasks: [],
      updated: new Date(),
      created: new Date(),
      ...overrides,
    })

    it('should not throw when game document is valid', () => {
      const mockGame = createMockGame()
      expect(() => validateGameDocument(mockGame as any)).not.toThrow()
    })

    it('should throw error when game document is null', () => {
      expect(() => validateGameDocument(null as any)).toThrow(
        'Game document is required',
      )
    })

    it('should throw error when game document is undefined', () => {
      expect(() => validateGameDocument(undefined as any)).toThrow(
        'Game document is required',
      )
    })

    it('should throw error when game document is empty object', () => {
      expect(() => validateGameDocument({} as any)).toThrow(
        'Game document must have an ID',
      )
    })

    it('should throw error when game document has no _id', () => {
      const gameWithoutId = createMockGame({ _id: undefined })

      expect(() => validateGameDocument(gameWithoutId as any)).toThrow(
        'Game document must have an ID',
      )
    })

    it('should throw error when game document has null _id', () => {
      const gameWithNullId = createMockGame({ _id: null })

      expect(() => validateGameDocument(gameWithNullId as any)).toThrow(
        'Game document must have an ID',
      )
    })

    it('should throw error when game document has empty string _id', () => {
      const gameWithEmptyId = createMockGame({ _id: '' })

      expect(() => validateGameDocument(gameWithEmptyId as any)).toThrow(
        'Game document must have an ID',
      )
    })

    it('should throw error when game document has no currentTask', () => {
      const gameWithoutCurrentTask = createMockGame({ currentTask: undefined })

      expect(() => validateGameDocument(gameWithoutCurrentTask as any)).toThrow(
        'Game document must have a current task',
      )
    })

    it('should throw error when game document has null currentTask', () => {
      const gameWithNullCurrentTask = createMockGame({ currentTask: null })

      expect(() =>
        validateGameDocument(gameWithNullCurrentTask as any),
      ).toThrow('Game document must have a current task')
    })

    it('should work with valid game that has minimal required fields', () => {
      const minimalGame = {
        _id: 'game123',
        currentTask: {
          _id: 'task123',
          type: 'LOBBY' as const,
          status: 'pending' as const,
          created: new Date(),
        },
      }

      expect(() => validateGameDocument(minimalGame as any)).not.toThrow()
    })

    it('should work with different task types', () => {
      const gameWithQuestionTask = createMockGame({
        currentTask: {
          _id: 'task123',
          type: 'QUESTION' as const,
          status: 'active' as const,
          created: new Date(),
          questionIndex: 0,
        },
      })

      expect(() =>
        validateGameDocument(gameWithQuestionTask as any),
      ).not.toThrow()
    })

    it('should work with string ID', () => {
      const gameWithStringId = createMockGame({ _id: 'string-id-123' })

      expect(() => validateGameDocument(gameWithStringId as any)).not.toThrow()
    })

    it('should work with numeric ID (as string)', () => {
      const gameWithNumericId = createMockGame({ _id: '12345' })

      expect(() => validateGameDocument(gameWithNumericId as any)).not.toThrow()
    })
  })
})
