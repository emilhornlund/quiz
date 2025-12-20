import {
  GameMode,
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'

import type { QuestionData } from './question-data-source.types'
import {
  createQuestionValidationModel,
  isClassicMultiChoiceQuestion,
  isClassicPinQuestion,
  isClassicPuzzleQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeQuestion,
  recomputeQuestionValidation,
} from './question-data-source.utils'

describe('recomputeQuestionValidation', () => {
  it('should return empty validation for Classic mode without type', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {},
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result).toEqual({
      ...question,
      validation: {},
    })
  })

  it('should return empty validation for Classic mode with unknown type', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: { type: 'UnknownType' as QuestionType },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result).toEqual({
      ...question,
      validation: {},
    })
  })

  it('should compute validation for Classic mode MultiChoice question', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.MultiChoice,
        question: 'Test question',
        options: [
          { value: 'Option 1', correct: true },
          { value: 'Option 2', correct: false },
        ],
        points: 1000,
        duration: 30,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicMultiChoiceQuestion(result)).toBe(true)

    if (isClassicMultiChoiceQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.MultiChoice,
          question: 'Test question',
          options: [
            {
              correct: true,
              value: 'Option 1',
            },
            {
              correct: false,
              value: 'Option 2',
            },
          ],
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: true,
          media: true,
          options: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should compute validation for Classic mode TrueFalse question', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.TrueFalse,
        question: 'Test question',
        correct: true,
        points: 1000,
        duration: 30,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicTrueFalseQuestion(result)).toBe(true)

    if (isClassicTrueFalseQuestion(result)) {
      expect(result).toEqual({
        mode: 'CLASSIC',
        data: {
          type: QuestionType.TrueFalse,
          question: 'Test question',
          correct: true,
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: true,
          media: true,
          correct: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should compute validation for Classic mode Range question', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.Range,
        question: 'Test question',
        min: 0,
        max: 100,
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicRangeQuestion(result)).toBe(true)

    if (isClassicRangeQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Range,
          question: 'Test question',
          min: 0,
          max: 100,
          margin: QuestionRangeAnswerMargin.Medium,
          correct: 50,
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: true,
          media: true,
          min: true,
          max: true,
          margin: true,
          correct: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should compute validation for Classic mode TypeAnswer question', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.TypeAnswer,
        question: 'Test question',
        options: ['Answer 1', 'Answer 2'],
        points: 1000,
        duration: 30,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicTypeAnswerQuestion(result)).toBe(true)

    if (isClassicTypeAnswerQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TypeAnswer,
          question: 'Test question',
          options: ['Answer 1', 'Answer 2'],
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: true,
          media: true,
          options: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should compute validation for Classic mode Pin question', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.Pin,
        question: 'Test question',
        imageURL: 'https://example.com/image.jpg',
        positionX: 0.5,
        positionY: 0.5,
        tolerance: QuestionPinTolerance.Medium,
        points: 1000,
        duration: 30,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicPinQuestion(result)).toBe(true)

    if (isClassicPinQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Pin,
          question: 'Test question',
          imageURL: 'https://example.com/image.jpg',
          positionX: 0.5,
          positionY: 0.5,
          tolerance: QuestionPinTolerance.Medium,
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: true,
          imageURL: true,
          positionX: true,
          positionY: true,
          tolerance: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should compute validation for Classic mode Puzzle question', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.Puzzle,
        question: 'Test question',
        values: ['Value 1', 'Value 2'],
        points: 1000,
        duration: 30,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicPuzzleQuestion(result)).toBe(true)

    if (isClassicPuzzleQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Puzzle,
          question: 'Test question',
          values: ['Value 1', 'Value 2'],
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: true,
          media: true,
          values: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should compute validation for ZeroToOneHundred mode question', () => {
    const question: QuestionData = {
      mode: GameMode.ZeroToOneHundred,
      data: {
        type: QuestionType.Range,
        question: 'Test question',
        correct: 50,
        duration: 60,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.ZeroToOneHundred)
    expect(isZeroToOneHundredRangeQuestion(result)).toBe(true)

    if (isZeroToOneHundredRangeQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.ZeroToOneHundred,
        data: {
          type: QuestionType.Range,
          question: 'Test question',
          correct: 50,
          duration: 60,
        },
        validation: {
          type: true,
          question: true,
          media: true,
          correct: true,
          duration: true,
          info: true,
        },
      })
    }
  })

  it('should handle invalid validation for required fields', () => {
    const question: QuestionData = {
      mode: GameMode.Classic,
      data: {
        type: QuestionType.MultiChoice,
        question: '',
        options: [],
        points: 0,
        duration: 0,
      },
      validation: {},
    }

    const result = recomputeQuestionValidation(question)

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicMultiChoiceQuestion(result)).toBe(true)

    if (isClassicMultiChoiceQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.MultiChoice,
          question: '',
          options: [],
          duration: 0,
          points: 0,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          options: false,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })
})

describe('createQuestionValidationModel', () => {
  it('should create MultiChoice question for Classic mode', () => {
    const result = createQuestionValidationModel(
      GameMode.Classic,
      QuestionType.MultiChoice,
    )

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicMultiChoiceQuestion(result)).toBe(true)

    if (isClassicMultiChoiceQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.MultiChoice,
          options: [],
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          options: false,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should create TrueFalse question for Classic mode', () => {
    const result = createQuestionValidationModel(
      GameMode.Classic,
      QuestionType.TrueFalse,
    )

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicTrueFalseQuestion(result)).toBe(true)

    if (isClassicTrueFalseQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TrueFalse,
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          correct: false,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should create Range question for Classic mode', () => {
    const result = createQuestionValidationModel(
      GameMode.Classic,
      QuestionType.Range,
    )

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicRangeQuestion(result)).toBe(true)

    if (isClassicRangeQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Range,
          min: 0,
          max: 100,
          margin: QuestionRangeAnswerMargin.Medium,
          correct: 50,
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          info: true,
          min: true,
          max: true,
          margin: true,
          correct: true,
          duration: true,
          points: true,
        },
      })
    }
  })

  it('should create TypeAnswer question for Classic mode', () => {
    const result = createQuestionValidationModel(
      GameMode.Classic,
      QuestionType.TypeAnswer,
    )

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicTypeAnswerQuestion(result)).toBe(true)

    if (isClassicTypeAnswerQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TypeAnswer,
          options: [],
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          options: false,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should create Pin question for Classic mode', () => {
    const result = createQuestionValidationModel(
      GameMode.Classic,
      QuestionType.Pin,
    )

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicPinQuestion(result)).toBe(true)

    if (isClassicPinQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Pin,
          positionX: 0.5,
          positionY: 0.5,
          tolerance: QuestionPinTolerance.Medium,
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: false,
          imageURL: true,
          positionX: true,
          positionY: true,
          tolerance: true,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should create Puzzle question for Classic mode', () => {
    const result = createQuestionValidationModel(
      GameMode.Classic,
      QuestionType.Puzzle,
    )

    expect(result.mode).toBe(GameMode.Classic)
    expect(isClassicPuzzleQuestion(result)).toBe(true)

    if (isClassicPuzzleQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Puzzle,
          values: [],
          duration: 30,
          points: 1000,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          values: false,
          duration: true,
          points: true,
          info: true,
        },
      })
    }
  })

  it('should create ZeroToOneHundred Range question', () => {
    const result = createQuestionValidationModel(
      GameMode.ZeroToOneHundred,
      QuestionType.Range,
    )

    expect(result.mode).toBe(GameMode.ZeroToOneHundred)
    expect(isZeroToOneHundredRangeQuestion(result)).toBe(true)

    if (isZeroToOneHundredRangeQuestion(result)) {
      expect(result).toEqual({
        mode: GameMode.ZeroToOneHundred,
        data: {
          type: QuestionType.Range,
          correct: 50,
          duration: 60,
        },
        validation: {
          type: true,
          question: false,
          media: true,
          correct: true,
          duration: true,
          info: true,
        },
      })
    }
  })

  it('should throw error for unknown game mode', () => {
    expect(() => {
      createQuestionValidationModel(
        'UnknownMode' as GameMode,
        QuestionType.MultiChoice,
      )
    }).toThrow('Unknown game mode or question type')
  })

  it('should throw error for unknown question type in Classic mode', () => {
    expect(() => {
      createQuestionValidationModel(
        GameMode.Classic,
        'UnknownType' as QuestionType,
      )
    }).toThrow('Unknown game mode or question type')
  })
})

describe('Type guard functions', () => {
  const classicMultiChoiceQuestion: QuestionData = {
    mode: GameMode.Classic,
    data: {
      type: QuestionType.MultiChoice,
      question: 'Test',
      options: [
        { value: 'A', correct: true },
        { value: 'B', correct: false },
      ],
      points: 1000,
      duration: 30,
    },
    validation: {},
  }

  const classicTrueFalseQuestion: QuestionData = {
    mode: GameMode.Classic,
    data: {
      type: QuestionType.TrueFalse,
      question: 'Test',
      correct: true,
      points: 1000,
      duration: 30,
    },
    validation: {},
  }

  const classicRangeQuestion: QuestionData = {
    mode: GameMode.Classic,
    data: {
      type: QuestionType.Range,
      question: 'Test',
      min: 0,
      max: 100,
      correct: 50,
      margin: QuestionRangeAnswerMargin.Medium,
      points: 1000,
      duration: 30,
    },
    validation: {},
  }

  const classicTypeAnswerQuestion: QuestionData = {
    mode: GameMode.Classic,
    data: {
      type: QuestionType.TypeAnswer,
      question: 'Test',
      options: ['Answer'],
      points: 1000,
      duration: 30,
    },
    validation: {},
  }

  const classicPinQuestion: QuestionData = {
    mode: GameMode.Classic,
    data: {
      type: QuestionType.Pin,
      question: 'Test',
      imageURL: 'https://example.com/image.jpg',
      positionX: 0.5,
      positionY: 0.5,
      tolerance: QuestionPinTolerance.Medium,
      points: 1000,
      duration: 30,
    },
    validation: {},
  }

  const classicPuzzleQuestion: QuestionData = {
    mode: GameMode.Classic,
    data: {
      type: QuestionType.Puzzle,
      question: 'Test',
      values: ['Value'],
      points: 1000,
      duration: 30,
    },
    validation: {},
  }

  const zeroToOneHundredQuestion: QuestionData = {
    mode: GameMode.ZeroToOneHundred,
    data: {
      type: QuestionType.Range,
      correct: 50,
      duration: 60,
    },
    validation: {},
  }

  describe('isClassicMultiChoiceQuestion', () => {
    it('should return true for Classic MultiChoice question', () => {
      expect(isClassicMultiChoiceQuestion(classicMultiChoiceQuestion)).toBe(
        true,
      )
    })

    it('should return false for non-MultiChoice questions', () => {
      expect(isClassicMultiChoiceQuestion(classicTrueFalseQuestion)).toBe(false)
      expect(isClassicMultiChoiceQuestion(classicRangeQuestion)).toBe(false)
      expect(isClassicMultiChoiceQuestion(zeroToOneHundredQuestion)).toBe(false)
    })

    it('should return false for question without data', () => {
      const question: QuestionData = {
        mode: GameMode.Classic,
        data: {},
        validation: {},
      }

      expect(isClassicMultiChoiceQuestion(question)).toBe(false)
    })

    it('should return false when ZeroToOneHundred question has no type', () => {
      const question: QuestionData = {
        mode: GameMode.ZeroToOneHundred,
        data: {},
        validation: {},
      }

      expect(isZeroToOneHundredRangeQuestion(question)).toBe(false)
    })

    describe('isClassicTrueFalseQuestion', () => {
      it('should return true for Classic TrueFalse question', () => {
        expect(isClassicTrueFalseQuestion(classicTrueFalseQuestion)).toBe(true)
      })

      it('should return false for non-TrueFalse questions', () => {
        expect(isClassicTrueFalseQuestion(classicMultiChoiceQuestion)).toBe(
          false,
        )
        expect(isClassicTrueFalseQuestion(classicRangeQuestion)).toBe(false)
        expect(isClassicTrueFalseQuestion(zeroToOneHundredQuestion)).toBe(false)
      })
    })

    describe('isClassicRangeQuestion', () => {
      it('should return true for Classic Range question', () => {
        expect(isClassicRangeQuestion(classicRangeQuestion)).toBe(true)
      })

      it('should return false for non-Range questions', () => {
        expect(isClassicRangeQuestion(classicMultiChoiceQuestion)).toBe(false)
        expect(isClassicRangeQuestion(classicTrueFalseQuestion)).toBe(false)
        expect(isClassicRangeQuestion(zeroToOneHundredQuestion)).toBe(false)
      })
    })

    describe('isClassicTypeAnswerQuestion', () => {
      it('should return true for Classic TypeAnswer question', () => {
        expect(isClassicTypeAnswerQuestion(classicTypeAnswerQuestion)).toBe(
          true,
        )
      })

      it('should return false for non-TypeAnswer questions', () => {
        expect(isClassicTypeAnswerQuestion(classicMultiChoiceQuestion)).toBe(
          false,
        )
        expect(isClassicTypeAnswerQuestion(classicTrueFalseQuestion)).toBe(
          false,
        )
        expect(isClassicTypeAnswerQuestion(zeroToOneHundredQuestion)).toBe(
          false,
        )
      })
    })

    describe('isClassicPinQuestion', () => {
      it('should return true for Classic Pin question', () => {
        expect(isClassicPinQuestion(classicPinQuestion)).toBe(true)
      })

      it('should return false for non-Pin questions', () => {
        expect(isClassicPinQuestion(classicMultiChoiceQuestion)).toBe(false)
        expect(isClassicPinQuestion(classicTrueFalseQuestion)).toBe(false)
        expect(isClassicPinQuestion(zeroToOneHundredQuestion)).toBe(false)
      })
    })

    describe('isClassicPuzzleQuestion', () => {
      it('should return true for Classic Puzzle question', () => {
        expect(isClassicPuzzleQuestion(classicPuzzleQuestion)).toBe(true)
      })

      it('should return false for non-Puzzle questions', () => {
        expect(isClassicPuzzleQuestion(classicMultiChoiceQuestion)).toBe(false)
        expect(isClassicPuzzleQuestion(classicTrueFalseQuestion)).toBe(false)
        expect(isClassicPuzzleQuestion(zeroToOneHundredQuestion)).toBe(false)
      })
    })

    describe('isZeroToOneHundredRangeQuestion', () => {
      it('should return true for ZeroToOneHundred Range question', () => {
        expect(isZeroToOneHundredRangeQuestion(zeroToOneHundredQuestion)).toBe(
          true,
        )
      })

      it('should return false for non-ZeroToOneHundred questions', () => {
        expect(
          isZeroToOneHundredRangeQuestion(classicMultiChoiceQuestion),
        ).toBe(false)
        expect(isZeroToOneHundredRangeQuestion(classicRangeQuestion)).toBe(
          false,
        )
        expect(isZeroToOneHundredRangeQuestion(classicTrueFalseQuestion)).toBe(
          false,
        )
      })

      it('should return false for question without data', () => {
        const question: QuestionData = {
          mode: GameMode.ZeroToOneHundred,
          data: {},
          validation: {},
        }

        expect(isZeroToOneHundredRangeQuestion(question)).toBe(false)
      })
    })

    describe('Type narrowing behavior', () => {
      it('should correctly narrow types for Classic MultiChoice', () => {
        if (isClassicMultiChoiceQuestion(classicMultiChoiceQuestion)) {
          expect(classicMultiChoiceQuestion.data.type).toBe(
            QuestionType.MultiChoice,
          )
          expect(classicMultiChoiceQuestion.data.options).toBeDefined()
          expect(classicMultiChoiceQuestion.data.points).toBeDefined()
          expect(classicMultiChoiceQuestion.data.duration).toBeDefined()
        }
      })

      it('should correctly narrow types for Classic TrueFalse', () => {
        if (isClassicTrueFalseQuestion(classicTrueFalseQuestion)) {
          expect(classicTrueFalseQuestion.data.type).toBe(
            QuestionType.TrueFalse,
          )
          expect(classicTrueFalseQuestion.data.correct).toBeDefined()
          expect(classicTrueFalseQuestion.data.points).toBeDefined()
          expect(classicTrueFalseQuestion.data.duration).toBeDefined()
        }
      })

      it('should correctly narrow types for Classic Range', () => {
        if (isClassicRangeQuestion(classicRangeQuestion)) {
          expect(classicRangeQuestion.data.type).toBe(QuestionType.Range)
          expect(classicRangeQuestion.data.min).toBeDefined()
          expect(classicRangeQuestion.data.max).toBeDefined()
          expect(classicRangeQuestion.data.correct).toBeDefined()
          expect(classicRangeQuestion.data.margin).toBeDefined()
          expect(classicRangeQuestion.data.points).toBeDefined()
          expect(classicRangeQuestion.data.duration).toBeDefined()
        }
      })

      it('should correctly narrow types for Classic TypeAnswer', () => {
        if (isClassicTypeAnswerQuestion(classicTypeAnswerQuestion)) {
          expect(classicTypeAnswerQuestion.data.type).toBe(
            QuestionType.TypeAnswer,
          )
          expect(classicTypeAnswerQuestion.data.options).toBeDefined()
          expect(classicTypeAnswerQuestion.data.points).toBeDefined()
          expect(classicTypeAnswerQuestion.data.duration).toBeDefined()
        }
      })

      it('should correctly narrow types for Classic Pin', () => {
        if (isClassicPinQuestion(classicPinQuestion)) {
          expect(classicPinQuestion.data.type).toBe(QuestionType.Pin)
          expect(classicPinQuestion.data.imageURL).toBeDefined()
          expect(classicPinQuestion.data.positionX).toBeDefined()
          expect(classicPinQuestion.data.positionY).toBeDefined()
          expect(classicPinQuestion.data.tolerance).toBeDefined()
          expect(classicPinQuestion.data.points).toBeDefined()
          expect(classicPinQuestion.data.duration).toBeDefined()
        }
      })

      it('should correctly narrow types for Classic Puzzle', () => {
        if (isClassicPuzzleQuestion(classicPuzzleQuestion)) {
          expect(classicPuzzleQuestion.data.type).toBe(QuestionType.Puzzle)
          expect(classicPuzzleQuestion.data.values).toBeDefined()
          expect(classicPuzzleQuestion.data.points).toBeDefined()
          expect(classicPuzzleQuestion.data.duration).toBeDefined()
        }
      })

      it('should correctly narrow types for ZeroToOneHundred Range', () => {
        if (isZeroToOneHundredRangeQuestion(zeroToOneHundredQuestion)) {
          expect(zeroToOneHundredQuestion.data.type).toBe(QuestionType.Range)
          expect(zeroToOneHundredQuestion.data.correct).toBeDefined()
          expect(zeroToOneHundredQuestion.data.duration).toBeDefined()
        }
      })
    })
  })
})
