import {
  GameMode,
  LanguageCode,
  QuestionType,
  QuizCategory,
  QuizRequestDto,
  QuizVisibility,
} from '@quiz/common'
import { act } from '@testing-library/react'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import QuizCreatorPage from './QuizCreatorPage'

type QuizId = string | undefined

type QuizSettings = {
  title?: string
  description?: string
  imageCoverURL?: string
  visibility?: QuizVisibility
  category?: QuizCategory
  languageCode?: LanguageCode
}

type ClassicQuestionData = {
  type:
    | QuestionType.MultiChoice
    | QuestionType.Range
    | QuestionType.TrueFalse
    | QuestionType.TypeAnswer
    | QuestionType.Pin
    | QuestionType.Puzzle
  id: string
}
type ZeroToOneHundredQuestionData = { type: QuestionType.Range; id: string }
type UnsupportedQuestionData = { type: 'Unsupported'; id: string }

type QuestionData =
  | {
      mode: GameMode.Classic
      data: ClassicQuestionData | UnsupportedQuestionData
      validation: Record<string, unknown>
    }
  | {
      mode: GameMode.ZeroToOneHundred
      data: ZeroToOneHundredQuestionData | UnsupportedQuestionData
      validation: Record<string, unknown>
    }

type QuizSummary = {
  mode: GameMode
  title: string
  description?: string
  imageCoverURL?: string
  visibility?: QuizVisibility
  category?: QuizCategory
  languageCode?: LanguageCode
}

type UseQueryResult<T> = {
  data?: T
  isLoading: boolean
  isError: boolean
}

type QuizCreatorPageUIProps = {
  gameMode?: GameMode
  onSelectGameMode: (mode: GameMode) => void
  quizSettings: QuizSettings
  allQuizSettingsValid: boolean
  onQuizSettingsValueChange: (next: unknown) => void
  onQuizSettingsValidChange: (next: boolean) => void
  questions: QuestionData[]
  allQuestionsValid: boolean
  selectedQuestion: unknown
  selectedQuestionIndex: number
  onSetQuestions: (next: QuestionData[]) => void
  onSelectedQuestionIndex: (index: number) => void
  onAddQuestion: () => void
  onQuestionValueChange: (index: number, value: unknown) => void
  onQuestionValueValidChange: (index: number, valid: boolean) => void
  onDropQuestionIndex: (index: number) => void
  onDuplicateQuestionIndex: (index: number) => void
  onDeleteQuestionIndex: (index: number) => void
  onReplaceQuestion: (index: number, next: QuestionData) => void
  isSavingQuiz: boolean
  onSaveQuiz: () => void
}

let latestUIProps: QuizCreatorPageUIProps | undefined

const navigateMock = vi.fn<(path: string) => void>()
const notifyErrorMock = vi.fn<(msg: string) => void>()

const createQuizMock = vi.fn<(request: QuizRequestDto) => Promise<void>>(() =>
  Promise.resolve(),
)
const updateQuizMock = vi.fn<
  (quizId: string, request: QuizRequestDto) => Promise<void>
>(() => Promise.resolve())

const addQuestionMock = vi.fn<(mode: GameMode, type: QuestionType) => void>()
const resetQuestionsMock = vi.fn<(mode: GameMode) => void>()

const setQuestionsMock = vi.fn<(next: QuestionData[]) => void>()
const selectQuestionMock = vi.fn<(index: number) => void>()
const setQuestionValueMock = vi.fn<(index: number, value: unknown) => void>()
const setQuestionValueValidMock =
  vi.fn<(index: number, valid: boolean) => void>()
const dropQuestionMock = vi.fn<(index: number) => void>()
const duplicateQuestionMock = vi.fn<(index: number) => void>()
const deleteQuestionMock = vi.fn<(index: number) => void>()
const replaceQuestionMock = vi.fn<(index: number, next: QuestionData) => void>()

const setQuizSettingsMock = vi.fn<(next: QuizSettings) => void>()
const onQuizSettingsValueChangeMock = vi.fn<(next: unknown) => void>()
const onQuizSettingsValidChangeMock = vi.fn<(next: boolean) => void>()

let mockQuizId: QuizId

let mockQuizSettings: QuizSettings
let mockAllQuizSettingsValid = true

let mockQuestions: QuestionData[] = []
let mockAllQuestionsValid = true

let mockQuizQueryState: UseQueryResult<QuizSummary>
let mockQuestionsQueryState: UseQueryResult<
  ClassicQuestionData[] | ZeroToOneHundredQuestionData[]
>

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ quizId: mockQuizId }),
  }
})

vi.mock('../../utils/notification.ts', () => ({
  notifyError: (msg: string) => notifyErrorMock(msg),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({
    createQuiz: createQuizMock,
    updateQuiz: updateQuizMock,
    getQuiz: vi.fn(),
    getQuizQuestions: vi.fn(),
  }),
}))

vi.mock('./utils/QuizSettingsDataSource', () => ({
  useQuizSettingsDataSource: () => ({
    values: mockQuizSettings,
    setValues: setQuizSettingsMock,
    valid: mockAllQuizSettingsValid,
    onValueChange: onQuizSettingsValueChangeMock,
    onValidChange: onQuizSettingsValidChangeMock,
  }),
}))

vi.mock('./utils/QuestionDataSource', () => ({
  useQuestionDataSource: () => ({
    questions: mockQuestions,
    setQuestions: setQuestionsMock,
    allQuestionsValid: mockAllQuestionsValid,
    selectedQuestion: undefined,
    selectedQuestionIndex: -1,
    selectQuestion: selectQuestionMock,
    addQuestion: addQuestionMock,
    setQuestionValue: setQuestionValueMock,
    setQuestionValueValid: setQuestionValueValidMock,
    dropQuestion: dropQuestionMock,
    duplicateQuestion: duplicateQuestionMock,
    deleteQuestion: deleteQuestionMock,
    replaceQuestion: replaceQuestionMock,
    resetQuestions: resetQuestionsMock,
  }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: { queryKey: readonly unknown[] }) => {
    const key = args.queryKey?.[0]
    if (key === 'quiz') return mockQuizQueryState
    if (key === 'quiz_questions') return mockQuestionsQueryState
    throw new Error(`Unexpected queryKey: ${String(key)}`)
  },
}))

vi.mock('./components/QuizCreatorPageUI', () => ({
  default: (props: QuizCreatorPageUIProps) => {
    latestUIProps = props
    return null
  },
}))

vi.mock('./utils/QuestionDataSource/question-data-source.utils.ts', () => ({
  isClassicMultiChoiceQuestion: (q: QuestionData) =>
    q.mode === GameMode.Classic && q.data.type === QuestionType.MultiChoice,
  isClassicRangeQuestion: (q: QuestionData) =>
    q.mode === GameMode.Classic && q.data.type === QuestionType.Range,
  isClassicTrueFalseQuestion: (q: QuestionData) =>
    q.mode === GameMode.Classic && q.data.type === QuestionType.TrueFalse,
  isClassicTypeAnswerQuestion: (q: QuestionData) =>
    q.mode === GameMode.Classic && q.data.type === QuestionType.TypeAnswer,
  isClassicPinQuestion: (q: QuestionData) =>
    q.mode === GameMode.Classic && q.data.type === QuestionType.Pin,
  isClassicPuzzleQuestion: (q: QuestionData) =>
    q.mode === GameMode.Classic && q.data.type === QuestionType.Puzzle,
  isZeroToOneHundredRangeDto: (q: QuestionData) =>
    q.mode === GameMode.ZeroToOneHundred && q.data.type === QuestionType.Range,
}))

const flushPromises = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
  })
}

const selectGameMode = async (mode: GameMode): Promise<void> => {
  expect(latestUIProps).toBeDefined()
  act(() => {
    latestUIProps?.onSelectGameMode(mode)
  })
  await waitFor(() => expect(latestUIProps?.gameMode).toBe(mode))
}

describe('QuizCreatorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    latestUIProps = undefined

    mockQuizId = undefined

    mockQuizSettings = {
      title: '  My quiz  ',
      description: '  Desc  ',
      imageCoverURL: 'https://example.com/cover.png',
      visibility: QuizVisibility.Public,
      category: QuizCategory.Other,
      languageCode: LanguageCode.English,
    }
    mockAllQuizSettingsValid = true

    mockQuestions = []
    mockAllQuestionsValid = true

    mockQuizQueryState = { data: undefined, isLoading: false, isError: false }
    mockQuestionsQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
    }
  })

  it('selecting game mode sets state and resets questions', async () => {
    render(<QuizCreatorPage />)

    expect(latestUIProps?.gameMode).toBeUndefined()

    await selectGameMode(GameMode.Classic)

    expect(resetQuestionsMock).toHaveBeenCalledWith(GameMode.Classic)
  })

  it('adding a question in Classic adds MultiChoice', async () => {
    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onAddQuestion()
    })

    expect(addQuestionMock).toHaveBeenCalledWith(
      GameMode.Classic,
      QuestionType.MultiChoice,
    )
  })

  it('adding a question in ZeroToOneHundred adds Range', async () => {
    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.ZeroToOneHundred)

    act(() => {
      latestUIProps?.onAddQuestion()
    })

    expect(addQuestionMock).toHaveBeenCalledWith(
      GameMode.ZeroToOneHundred,
      QuestionType.Range,
    )
  })

  it('save: if already saving, it returns early', async () => {
    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })
    expect(createQuizMock).toHaveBeenCalledTimes(1)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(createQuizMock).toHaveBeenCalledTimes(1)
    expect(updateQuizMock).toHaveBeenCalledTimes(0)

    await flushPromises()
    await waitFor(() => expect(latestUIProps?.isSavingQuiz).toBe(false))
  })

  it('save: invalid settings/questions shows validation error', async () => {
    mockAllQuizSettingsValid = false

    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(notifyErrorMock).toHaveBeenCalledWith(
      'Please fix the highlighted fields before saving',
    )
    expect(createQuizMock).not.toHaveBeenCalled()
    expect(updateQuizMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('save: missing game mode shows error', async () => {
    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(notifyErrorMock).toHaveBeenCalledWith('Game mode is required')
    expect(createQuizMock).not.toHaveBeenCalled()
    expect(updateQuizMock).not.toHaveBeenCalled()
  })

  it('save: missing/blank title shows error', async () => {
    mockQuizSettings = {
      ...mockQuizSettings,
      title: '   ',
    }

    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(notifyErrorMock).toHaveBeenCalledWith('Title is required')
    expect(createQuizMock).not.toHaveBeenCalled()
    expect(updateQuizMock).not.toHaveBeenCalled()
  })

  it('save: questions length mismatch (invalid/unsupported) shows error', async () => {
    mockQuestions = [
      {
        mode: GameMode.Classic,
        data: { type: QuestionType.MultiChoice, id: 'q1' },
        validation: {},
      },
      {
        mode: GameMode.Classic,
        data: { type: 'Unsupported', id: 'q2' },
        validation: {},
      },
    ]

    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(notifyErrorMock).toHaveBeenCalledWith(
      'Some questions are invalid or unsupported. Please review your questions.',
    )
    expect(createQuizMock).not.toHaveBeenCalled()
    expect(updateQuizMock).not.toHaveBeenCalled()
  })

  it('save: creates Classic quiz with trimmed title/description and defaults', async () => {
    mockQuizSettings = {
      title: '  My quiz  ',
      description: '  Desc  ',
      imageCoverURL: 'https://example.com/cover.png',
      visibility: undefined,
      category: undefined,
      languageCode: undefined,
    }

    mockQuestions = [
      {
        mode: GameMode.Classic,
        data: { type: QuestionType.MultiChoice, id: 'q1' },
        validation: {},
      },
      {
        mode: GameMode.Classic,
        data: { type: QuestionType.TrueFalse, id: 'q2' },
        validation: {},
      },
    ]

    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(createQuizMock).toHaveBeenCalledTimes(1)
    const request = createQuizMock.mock.calls[0]?.[0]
    expect(request).toEqual({
      title: 'My quiz',
      description: 'Desc',
      visibility: QuizVisibility.Public,
      category: QuizCategory.Other,
      imageCoverURL: 'https://example.com/cover.png',
      languageCode: LanguageCode.English,
      mode: GameMode.Classic,
      questions: [
        { type: QuestionType.MultiChoice, id: 'q1' },
        { type: QuestionType.TrueFalse, id: 'q2' },
      ],
    })

    await flushPromises()
    expect(navigateMock).toHaveBeenCalledWith('/profile/quizzes')
    await waitFor(() => expect(latestUIProps?.isSavingQuiz).toBe(false))
  })

  it('save: creates ZeroToOneHundred quiz and only saves supported range questions', async () => {
    mockQuestions = [
      {
        mode: GameMode.ZeroToOneHundred,
        data: { type: QuestionType.Range, id: 'q1' },
        validation: {},
      },
      {
        mode: GameMode.ZeroToOneHundred,
        data: { type: QuestionType.Range, id: 'q2' },
        validation: {},
      },
    ]

    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.ZeroToOneHundred)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(createQuizMock).toHaveBeenCalledTimes(1)
    const request = createQuizMock.mock.calls[0]?.[0]
    expect(request).toMatchObject({
      mode: GameMode.ZeroToOneHundred,
      questions: [
        { type: QuestionType.Range, id: 'q1' },
        { type: QuestionType.Range, id: 'q2' },
      ],
    })

    await flushPromises()
    expect(navigateMock).toHaveBeenCalledWith('/profile/quizzes')
  })

  it('save: updates quiz when quizId exists', async () => {
    mockQuizId = 'quiz-123'
    mockQuestions = [
      {
        mode: GameMode.Classic,
        data: { type: QuestionType.MultiChoice, id: 'q1' },
        validation: {},
      },
    ]

    render(<QuizCreatorPage />)

    await selectGameMode(GameMode.Classic)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(updateQuizMock).toHaveBeenCalledTimes(1)
    expect(updateQuizMock.mock.calls[0]?.[0]).toBe('quiz-123')
    expect(updateQuizMock.mock.calls[0]?.[1]).toMatchObject({
      mode: GameMode.Classic,
      questions: [{ type: QuestionType.MultiChoice, id: 'q1' }],
    })

    await flushPromises()
    expect(navigateMock).toHaveBeenCalledWith('/profile/quizzes')
  })
})
