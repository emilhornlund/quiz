import {
  GameMode,
  QuestionMultiChoiceDto,
  QuestionRangeDto,
  QuestionType,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useQuestionDataSource } from './question-data-source.hook.tsx'

describe('useQuestionDataSource', () => {
  it('returns expected initial state', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    expect(result.current.questions).toEqual([])
    expect(result.current.selectedQuestion).toBeUndefined()
    expect(result.current.selectedQuestionIndex).toBe(-1)
    expect(result.current.allQuestionsValid).toBe(true)
  })

  it('setQuestions([]) sets selectedIndex=-1', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.setQuestions([])
    })

    expect(result.current.questions).toEqual([])
    expect(result.current.selectedQuestionIndex).toBe(-1)
    expect(result.current.selectedQuestion).toBeUndefined()
  })

  it('resetQuestions(Classic) initializes a single question and selects index 0', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    expect(result.current.questions).toHaveLength(1)
    expect(result.current.selectedQuestionIndex).toBe(0)
    expect(result.current.selectedQuestion).toBeDefined()
    expect(result.current.selectedQuestion?.mode).toBe(GameMode.Classic)
    expect(result.current.selectedQuestion?.data.type).toBe(
      QuestionType.MultiChoice,
    )
  })

  it('resetQuestions(ZeroToOneHundred) initializes a single question and selects index 0', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.ZeroToOneHundred)
    })

    expect(result.current.questions).toHaveLength(1)
    expect(result.current.selectedQuestionIndex).toBe(0)
    expect(result.current.selectedQuestion).toBeDefined()
    expect(result.current.selectedQuestion?.mode).toBe(
      GameMode.ZeroToOneHundred,
    )
    expect(result.current.selectedQuestion?.data.type).toBe(QuestionType.Range)
  })

  it('selectQuestion throws for invalid index', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    expect(() => result.current.selectQuestion(-1)).toThrow(
      'Invalid question index',
    )
    expect(() => result.current.selectQuestion(1)).toThrow(
      'Invalid question index',
    )
  })

  it('addQuestion appends a question and selects it', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    act(() => {
      result.current.addQuestion(GameMode.Classic, QuestionType.TrueFalse)
    })

    expect(result.current.questions).toHaveLength(2)
    expect(result.current.selectedQuestionIndex).toBe(1)
    expect(result.current.selectedQuestion?.mode).toBe(GameMode.Classic)
    expect(result.current.selectedQuestion?.data.type).toBe(
      QuestionType.TrueFalse,
    )
  })

  it('setQuestionValue updates selected question data', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    act(() => {
      result.current.setQuestionValue('question', 'Hello?')
    })

    expect(result.current.selectedQuestion?.data.question).toBe('Hello?')
    expect(result.current.questions[0].data.question).toBe('Hello?')
  })

  it('setQuestionValue throws when no selected question exists', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    expect(() => {
      act(() => {
        result.current.setQuestionValue<QuestionMultiChoiceDto>('question', 'x')
      })
    }).toThrow('Invalid question index')
  })

  it('setQuestionValueValid updates selected question validation entry', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    act(() => {
      result.current.setQuestionValueValid('question', false)
    })

    expect(result.current.questions[0].validation.question).toBe(false)
    expect(result.current.allQuestionsValid).toBe(false)

    act(() => {
      result.current.setQuestionValueValid('question', true)
    })

    expect(result.current.questions[0].validation.question).toBe(true)
  })

  it('duplicateQuestion inserts a copy after the given index and selects original index', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    act(() => {
      result.current.addQuestion(GameMode.Classic, QuestionType.TrueFalse)
    })

    act(() => {
      result.current.selectQuestion(0)
    })

    act(() => {
      result.current.duplicateQuestion(0)
    })

    expect(result.current.questions).toHaveLength(3)
    expect(result.current.selectedQuestionIndex).toBe(0)

    expect(result.current.questions[1]).toEqual(result.current.questions[0])
    expect(result.current.questions[1]).not.toBe(result.current.questions[0])
  })

  it('deleteQuestion removes the question and adjusts selectedIndex', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
      result.current.addQuestion(GameMode.Classic, QuestionType.TrueFalse)
      result.current.addQuestion(GameMode.Classic, QuestionType.Range)
    })

    expect(result.current.questions).toHaveLength(3)

    act(() => {
      result.current.selectQuestion(2)
    })
    expect(result.current.selectedQuestionIndex).toBe(2)

    act(() => {
      result.current.deleteQuestion(2)
    })

    expect(result.current.questions).toHaveLength(2)
    expect(result.current.selectedQuestionIndex).toBe(1)

    act(() => {
      result.current.deleteQuestion(1)
    })

    expect(result.current.questions).toHaveLength(1)
    expect(result.current.selectedQuestionIndex).toBe(0)

    act(() => {
      result.current.deleteQuestion(0)
    })

    expect(result.current.questions).toHaveLength(0)
    expect(result.current.selectedQuestionIndex).toBe(-1)
    expect(result.current.selectedQuestion).toBeUndefined()
  })

  it('dropQuestion swaps selected question with the target index and selects the target index', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    act(() => {
      result.current.addQuestion(GameMode.Classic, QuestionType.TrueFalse)
    })

    act(() => {
      result.current.addQuestion(GameMode.Classic, QuestionType.Range)
    })

    act(() => {
      result.current.selectQuestion(0)
    })

    const before0 = result.current.questions[0]
    const before2 = result.current.questions[2]

    act(() => {
      result.current.dropQuestion(2)
    })

    expect(result.current.selectedQuestionIndex).toBe(2)
    expect(result.current.questions[0]).toBe(before2)
    expect(result.current.questions[2]).toBe(before0)
  })

  it('replaceQuestion replaces the selected classic question type while preserving shared fields', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.Classic)
    })

    act(() => {
      result.current.setQuestionValue<QuestionMultiChoiceDto>(
        'question',
        'Carry over',
      )
    })
    act(() => {
      result.current.setQuestionValue<QuestionMultiChoiceDto>('points', 777)
    })
    act(() => {
      result.current.setQuestionValue<QuestionMultiChoiceDto>('duration', 12)
    })

    act(() => {
      result.current.replaceQuestion(QuestionType.Range)
    })

    const q = result.current.selectedQuestion
    expect(q).toBeDefined()
    expect(q!.mode).toBe(GameMode.Classic)

    const data = q!.data as Partial<QuestionRangeDto>
    expect(data).toEqual({
      type: QuestionType.Range,
      question: 'Carry over',
      duration: 12,
      points: 777,
      max: 100,
      min: 0,
      correct: 0,
      margin: 'MEDIUM',
      info: undefined,
    })
  })

  it('replaceQuestion replaces the selected zero-to-one-hundred question with Range and keeps shared fields', () => {
    const { result } = renderHook(() => useQuestionDataSource())

    act(() => {
      result.current.resetQuestions(GameMode.ZeroToOneHundred)
    })

    act(() => {
      result.current.setQuestionValue<QuestionZeroToOneHundredRangeDto>(
        'question',
        'Z100',
      )
    })
    act(() => {
      result.current.setQuestionValue<QuestionZeroToOneHundredRangeDto>(
        'duration',
        55,
      )
    })

    act(() => {
      result.current.replaceQuestion(QuestionType.Range)
    })

    const q = result.current.selectedQuestion
    expect(q).toBeDefined()
    expect(q!.mode).toBe(GameMode.ZeroToOneHundred)
    const data = q!.data as Partial<QuestionZeroToOneHundredRangeDto>
    expect(data).toEqual({
      type: QuestionType.Range,
      question: 'Z100',
      media: undefined,
      correct: 0,
      duration: 55,
      info: undefined,
    })
  })
})
