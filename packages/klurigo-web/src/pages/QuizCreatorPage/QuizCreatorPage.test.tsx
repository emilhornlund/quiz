import type { QuizRequestDto } from '@klurigo/common'
import {
  GameMode,
  LanguageCode,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@klurigo/common'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import QuizCreatorPage from './QuizCreatorPage'

/**
 * ---------------------------------------------------------------------------
 * Mocks
 * ---------------------------------------------------------------------------
 */

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
  isFetchedAfterMount?: boolean
}

type QuizSettings = {
  title?: string
  description?: string
  imageCoverURL?: string
  visibility?: QuizVisibility
  category?: QuizCategory
  languageCode?: LanguageCode
}

type QuizCreatorPageUIProps = {
  gameMode?: GameMode
  onSelectGameMode: (mode: GameMode) => void
  quizSettings: QuizSettings
  quizSettingsValidation: Record<string, boolean | undefined>
  allQuizSettingsValid: boolean
  onQuizSettingsValueChange: <K extends keyof QuizSettings>(
    key: K,
    value?: QuizSettings[K],
  ) => void
  questions: unknown[]
  questionValidations: Record<string, unknown>[]
  allQuestionsValid: boolean
  selectedQuestion: unknown
  selectedQuestionIndex: number
  onSetQuestions: (next: unknown[]) => void
  onSelectedQuestionIndex: (index: number) => void
  onAddQuestion: () => void
  onQuestionValueChange: (key: string, value?: unknown) => void
  onDropQuestionIndex: () => void
  onDuplicateQuestionIndex: (index: number) => void
  onDeleteQuestionIndex: (index: number) => void
  onReplaceQuestion: (index: number) => void
  isSavingQuiz: boolean
  onSaveQuiz: () => void
}

let latestUIProps: QuizCreatorPageUIProps | undefined

let mockQuizId: string | undefined

const navigateMock = vi.fn<(path: string) => void>()
const notifyErrorMock = vi.fn<(msg: string) => void>()

const createQuizMock = vi.fn<(request: QuizRequestDto) => Promise<void>>(() =>
  Promise.resolve(),
)
const updateQuizMock = vi.fn<
  (quizId: string, request: QuizRequestDto) => Promise<void>
>(() => Promise.resolve())
const getQuizMock = vi.fn<(quizId: string) => Promise<QuizSummary>>()
const getQuizQuestionsMock = vi.fn<(quizId: string) => Promise<unknown[]>>()

const setGameModeMock = vi.fn<(mode: GameMode) => void>()
const setQuestionsMock = vi.fn<(qs: unknown[]) => void>()
const selectQuestionMock = vi.fn<(index: number) => void>()
const addQuestionMock = vi.fn<(type: QuestionType) => void>()
const updateSelectedQuestionFieldMock =
  vi.fn<(key: string, value?: unknown) => void>()
const duplicateQuestionMock = vi.fn<(index: number) => void>()
const deleteQuestionMock = vi.fn<(index: number) => void>()
const replaceQuestionMock = vi.fn<(index: number) => void>()

const setQuizSettingsMock = vi.fn<(next: QuizSettings) => void>()
const updateSettingsFieldMock =
  vi.fn<
    <K extends keyof QuizSettings>(key: K, value?: QuizSettings[K]) => void
  >()

let mockQuizSettings: QuizSettings
let mockQuizSettingsValidation: Record<string, boolean | undefined>
let mockAllQuizSettingsValid = true

let mockGameMode: GameMode | undefined
let mockQuestions: unknown[] = []
let mockQuestionValidations: Record<string, unknown>[] = []
let mockAllQuestionsValid = true
let mockSelectedQuestion: unknown
let mockSelectedQuestionIndex = -1

let mockQuizQueryState: UseQueryResult<QuizSummary>
let mockQuestionsQueryState: UseQueryResult<unknown[]>

/**
 * Guards used during save filtering.
 */
const isClassicMultiChoiceQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()
const isClassicRangeQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()
const isClassicTrueFalseQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()
const isClassicTypeAnswerQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()
const isClassicPinQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()
const isClassicPuzzleQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()
const isZeroToOneHundredRangeQuestionMock =
  vi.fn<(mode: GameMode, q: unknown) => boolean>()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ quizId: mockQuizId }),
  }
})

vi.mock('../../utils/notification', () => ({
  notifyError: (msg: string) => notifyErrorMock(msg),
}))

vi.mock('../../api', () => ({
  useKlurigoServiceClient: () => ({
    createQuiz: createQuizMock,
    updateQuiz: updateQuizMock,
    getQuiz: getQuizMock,
    getQuizQuestions: getQuizQuestionsMock,
  }),
}))

vi.mock('./utils/QuizSettingsDataSource', () => ({
  useQuizSettingsDataSource: () => ({
    settings: mockQuizSettings,
    setSettings: setQuizSettingsMock,
    settingsValidation: mockQuizSettingsValidation,
    allSettingsValid: mockAllQuizSettingsValid,
    updateSettingsField: updateSettingsFieldMock,
  }),
}))

vi.mock('./utils/QuestionDataSource', async () => {
  const React = await vi.importActual<typeof import('react')>('react')

  return {
    useQuestionDataSource: () => {
      const [gameMode, setGameMode] = React.useState<GameMode | undefined>(
        mockGameMode,
      )
      const [questions, setQuestions] = React.useState<unknown[]>(mockQuestions)

      const selectQuestion = (index: number) => {
        selectQuestionMock(index)
      }

      const setGameModeWrapped = (mode: GameMode) => {
        mockGameMode = mode
        setGameModeMock(mode)
        setGameMode(mode)
      }

      const setQuestionsWrapped = (qs: unknown[]) => {
        mockQuestions = qs
        setQuestionsMock(qs)
        setQuestions(qs)
      }

      return {
        gameMode,
        setGameMode: setGameModeWrapped,

        questions,
        setQuestions: setQuestionsWrapped,

        questionValidations: mockQuestionValidations,
        allQuestionsValid: mockAllQuestionsValid,

        selectedQuestion: mockSelectedQuestion,
        selectedQuestionIndex: mockSelectedQuestionIndex,

        selectQuestion,

        addQuestion: addQuestionMock,
        updateSelectedQuestionField: updateSelectedQuestionFieldMock,
        duplicateQuestion: duplicateQuestionMock,
        deleteQuestion: deleteQuestionMock,
        replaceQuestion: replaceQuestionMock,
      }
    },
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const latestUseQueryArgs: any[] = []

vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: { queryKey: readonly unknown[]; enabled?: boolean }) => {
    latestUseQueryArgs.push(args)
    const key = String(args.queryKey?.[0] ?? '')
    if (key === 'quiz') return mockQuizQueryState
    if (key === 'quiz_questions') return mockQuestionsQueryState
    throw new Error(`Unexpected queryKey: ${key}`)
  },
}))

vi.mock('../../components', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
  Page: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page">{children}</div>
  ),
}))

vi.mock('./components/QuizCreatorPageUI', () => ({
  default: (props: QuizCreatorPageUIProps) => {
    latestUIProps = props
    return <div data-testid="quiz-creator-ui" />
  },
}))

vi.mock('../../utils/questions', () => ({
  isClassicMultiChoiceQuestion: (mode: GameMode, q: unknown) =>
    isClassicMultiChoiceQuestionMock(mode, q),
  isClassicRangeQuestion: (mode: GameMode, q: unknown) =>
    isClassicRangeQuestionMock(mode, q),
  isClassicTrueFalseQuestion: (mode: GameMode, q: unknown) =>
    isClassicTrueFalseQuestionMock(mode, q),
  isClassicTypeAnswerQuestion: (mode: GameMode, q: unknown) =>
    isClassicTypeAnswerQuestionMock(mode, q),
  isClassicPinQuestion: (mode: GameMode, q: unknown) =>
    isClassicPinQuestionMock(mode, q),
  isClassicPuzzleQuestion: (mode: GameMode, q: unknown) =>
    isClassicPuzzleQuestionMock(mode, q),
  isZeroToOneHundredRangeQuestion: (mode: GameMode, q: unknown) =>
    isZeroToOneHundredRangeQuestionMock(mode, q),
}))

const flushPromises = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
  })
}

const setAllGuardsFalse = (): void => {
  isClassicMultiChoiceQuestionMock.mockReturnValue(false)
  isClassicRangeQuestionMock.mockReturnValue(false)
  isClassicTrueFalseQuestionMock.mockReturnValue(false)
  isClassicTypeAnswerQuestionMock.mockReturnValue(false)
  isClassicPinQuestionMock.mockReturnValue(false)
  isClassicPuzzleQuestionMock.mockReturnValue(false)
  isZeroToOneHundredRangeQuestionMock.mockReturnValue(false)
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
    mockQuizSettingsValidation = {}
    mockAllQuizSettingsValid = true

    mockGameMode = undefined
    mockQuestions = []
    mockQuestionValidations = []
    mockAllQuestionsValid = true
    mockSelectedQuestion = undefined
    mockSelectedQuestionIndex = -1

    mockQuizQueryState = { data: undefined, isLoading: false, isError: false }
    mockQuestionsQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: false,
    }

    setAllGuardsFalse()
  })

  it('renders spinner page when quizId exists and quiz or questions query is loading or errored', () => {
    mockQuizId = 'quiz-1'
    mockQuizQueryState = { data: undefined, isLoading: true, isError: false }
    mockQuestionsQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
    }

    render(<QuizCreatorPage />)

    expect(latestUIProps).toBeUndefined()
    expect(document.querySelector('[data-testid="page"]')).toBeTruthy()
    expect(
      document.querySelector('[data-testid="loading-spinner"]'),
    ).toBeTruthy()
  })

  it('when originalQuiz loads, sets game mode and copies settings', async () => {
    mockQuizId = 'quiz-123'
    mockQuizQueryState = {
      data: {
        mode: GameMode.Classic,
        title: 'Loaded title',
        description: 'Loaded desc',
        imageCoverURL: 'https://cdn/cover.jpg',
        visibility: QuizVisibility.Private,
        category: QuizCategory.Other,
        languageCode: LanguageCode.Swedish,
      },
      isLoading: false,
      isError: false,
    }

    render(<QuizCreatorPage />)

    expect(setGameModeMock).toHaveBeenCalledWith(GameMode.Classic)
    expect(setQuizSettingsMock).toHaveBeenCalledWith({
      title: 'Loaded title',
      description: 'Loaded desc',
      imageCoverURL: 'https://cdn/cover.jpg',
      visibility: QuizVisibility.Private,
      category: QuizCategory.Other,
      languageCode: LanguageCode.Swedish,
    })
  })

  it('configures quiz_questions query with refetchOnMount=always', () => {
    render(<QuizCreatorPage />)

    const quizQuestionsCall = latestUseQueryArgs.find(
      (a) => String(a.queryKey?.[0]) === 'quiz_questions',
    )

    expect(quizQuestionsCall?.refetchOnMount).toBe('always')
  })

  it('when gameMode and originalQuizQuestions load, sets questions and selects question 0', async () => {
    mockQuizId = 'quiz-123'

    mockQuizQueryState = {
      data: {
        mode: GameMode.Classic,
        title: 'Loaded title',
        visibility: QuizVisibility.Public,
        category: QuizCategory.Other,
        languageCode: LanguageCode.English,
      },
      isLoading: false,
      isError: false,
    }

    const loadedQuestions = [{ id: 'q1' }, { id: 'q2' }]

    mockQuestionsQueryState = {
      data: loadedQuestions,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: true,
    }

    render(<QuizCreatorPage />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(setQuestionsMock).toHaveBeenCalledWith(loadedQuestions)
    expect(selectQuestionMock).toHaveBeenCalledWith(0)
  })

  it('handleAddQuestion adds MultiChoice for Classic and Range for ZeroToOneHundred', async () => {
    render(<QuizCreatorPage />)
    expect(latestUIProps).toBeDefined()

    act(() => {
      latestUIProps?.onSelectGameMode(GameMode.Classic)
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      latestUIProps?.onAddQuestion()
    })
    expect(addQuestionMock).toHaveBeenCalledWith(QuestionType.MultiChoice)

    addQuestionMock.mockClear()

    act(() => {
      latestUIProps?.onSelectGameMode(GameMode.ZeroToOneHundred)
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      latestUIProps?.onAddQuestion()
    })
    expect(addQuestionMock).toHaveBeenCalledWith(QuestionType.Range)
  })

  it('save: if invalid settings or questions -> notify and does not save', () => {
    mockAllQuizSettingsValid = false

    render(<QuizCreatorPage />)

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

  it('save: missing game mode -> notify and does not save', () => {
    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(notifyErrorMock).toHaveBeenCalledWith('Game mode is required')
    expect(createQuizMock).not.toHaveBeenCalled()
    expect(updateQuizMock).not.toHaveBeenCalled()
  })

  it('save: missing/blank title -> notify and does not save', () => {
    mockGameMode = GameMode.Classic
    mockQuizSettings = {
      ...mockQuizSettings,
      title: '   ',
    }

    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(notifyErrorMock).toHaveBeenCalledWith('Title is required')
    expect(createQuizMock).not.toHaveBeenCalled()
    expect(updateQuizMock).not.toHaveBeenCalled()
  })

  it('save: filters questions and errors if some are unsupported (length mismatch)', () => {
    mockGameMode = GameMode.Classic

    const q1 = { type: QuestionType.MultiChoice, id: 'q1' }
    const q2 = { type: 'Unsupported', id: 'q2' }
    mockQuestions = [q1, q2]

    // Only q1 is considered valid classic multi
    isClassicMultiChoiceQuestionMock.mockImplementation((_mode, q) => q === q1)

    render(<QuizCreatorPage />)

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
    mockQuizId = undefined
    mockGameMode = GameMode.Classic

    mockQuizSettings = {
      title: '  My quiz  ',
      description: '  Desc  ',
      imageCoverURL: 'https://example.com/cover.png',
      visibility: undefined,
      category: undefined,
      languageCode: undefined,
    }

    const q1 = { type: QuestionType.MultiChoice, id: 'q1' }
    const q2 = { type: QuestionType.TrueFalse, id: 'q2' }
    mockQuestions = [q1, q2]

    isClassicMultiChoiceQuestionMock.mockImplementation((_mode, q) => q === q1)
    isClassicTrueFalseQuestionMock.mockImplementation((_mode, q) => q === q2)

    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(createQuizMock).toHaveBeenCalledTimes(1)
    const req = createQuizMock.mock.calls[0]?.[0]
    expect(req).toEqual({
      title: 'My quiz',
      description: 'Desc',
      visibility: QuizVisibility.Public,
      category: QuizCategory.Other,
      imageCoverURL: 'https://example.com/cover.png',
      languageCode: LanguageCode.English,
      mode: GameMode.Classic,
      questions: [q1, q2],
    })

    await flushPromises()
    expect(navigateMock).toHaveBeenCalledWith('/profile/quizzes')
  })

  it('save: creates ZeroToOneHundred quiz and only saves supported range questions', async () => {
    mockQuizId = undefined
    mockGameMode = GameMode.ZeroToOneHundred

    const q1 = { type: QuestionType.Range, id: 'q1' }
    const q2 = { type: QuestionType.Range, id: 'q2' }
    mockQuestions = [q1, q2]

    isZeroToOneHundredRangeQuestionMock.mockReturnValue(true)

    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(createQuizMock).toHaveBeenCalledTimes(1)
    const req = createQuizMock.mock.calls[0]?.[0]
    expect(req).toMatchObject({
      mode: GameMode.ZeroToOneHundred,
      questions: [q1, q2],
    })

    await flushPromises()
    expect(navigateMock).toHaveBeenCalledWith('/profile/quizzes')
  })

  it('save: updates quiz when quizId exists', async () => {
    mockQuizId = 'quiz-123'
    mockGameMode = GameMode.Classic

    const q1 = { type: QuestionType.MultiChoice, id: 'q1' }
    mockQuestions = [q1]
    isClassicMultiChoiceQuestionMock.mockReturnValue(true)

    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(updateQuizMock).toHaveBeenCalledTimes(1)
    expect(updateQuizMock.mock.calls[0]?.[0]).toBe('quiz-123')
    expect(updateQuizMock.mock.calls[0]?.[1]).toMatchObject({
      mode: GameMode.Classic,
      questions: [q1],
    })

    await flushPromises()
    expect(navigateMock).toHaveBeenCalledWith('/profile/quizzes')
  })

  it('save: ignores subsequent save attempts while saving (create called once)', async () => {
    mockGameMode = GameMode.Classic
    const q1 = { type: QuestionType.MultiChoice, id: 'q1' }
    mockQuestions = [q1]
    isClassicMultiChoiceQuestionMock.mockReturnValue(true)

    let resolveCreate: (() => void) | undefined
    createQuizMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve
        }),
    )

    render(<QuizCreatorPage />)

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      latestUIProps?.onSaveQuiz()
    })

    expect(createQuizMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveCreate?.()
      await Promise.resolve()
    })
  })

  it('hydrates questions only once per quizId', async () => {
    mockQuizId = 'quiz-123'
    mockQuizQueryState = {
      data: {
        mode: GameMode.Classic,
        title: 'Loaded title',
        visibility: QuizVisibility.Public,
        category: QuizCategory.Other,
        languageCode: LanguageCode.English,
      },
      isLoading: false,
      isError: false,
    }

    const loadedQuestions = [{ id: 'q1' }, { id: 'q2' }]

    mockQuestionsQueryState = {
      data: loadedQuestions,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: true,
    }

    const { rerender } = render(<QuizCreatorPage />)

    await flushPromises()

    expect(setQuestionsMock).toHaveBeenCalledTimes(1)
    expect(setQuestionsMock).toHaveBeenCalledWith(loadedQuestions)
    expect(selectQuestionMock).toHaveBeenCalledWith(0)

    rerender(<QuizCreatorPage />)
    await flushPromises()

    expect(setQuestionsMock).toHaveBeenCalledTimes(1)
    expect(selectQuestionMock).toHaveBeenCalledTimes(1)
  })

  it('does not hydrate questions from cached query data when not fetched after mount', async () => {
    mockQuizId = 'quiz-123'

    mockQuizQueryState = {
      data: {
        mode: GameMode.Classic,
        title: 'Loaded title',
        visibility: QuizVisibility.Public,
        category: QuizCategory.Other,
        languageCode: LanguageCode.English,
      },
      isLoading: false,
      isError: false,
    }

    const cachedQuestions = [{ id: 'q1' }, { id: 'q2' }]

    mockQuestionsQueryState = {
      data: cachedQuestions,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: false,
    }

    render(<QuizCreatorPage />)
    await flushPromises()

    expect(setQuestionsMock).not.toHaveBeenCalled()
    expect(selectQuestionMock).not.toHaveBeenCalled()
  })

  it('does not overwrite local question edits after initial hydration', async () => {
    mockQuizId = 'quiz-123'
    mockQuizQueryState = {
      data: {
        mode: GameMode.Classic,
        title: 'Loaded title',
        visibility: QuizVisibility.Public,
        category: QuizCategory.Other,
        languageCode: LanguageCode.English,
      },
      isLoading: false,
      isError: false,
    }

    const loadedQuestions = [{ id: 'q1' }, { id: 'q2' }]

    mockQuestionsQueryState = {
      data: loadedQuestions,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: true,
    }

    const { rerender } = render(<QuizCreatorPage />)

    await flushPromises()

    // First hydration call
    expect(setQuestionsMock).toHaveBeenCalledTimes(1)
    expect(setQuestionsMock.mock.calls[0]?.[0]).toBe(loadedQuestions)

    const localQuestions = [...loadedQuestions, { id: 'q3-local' }]

    act(() => {
      latestUIProps?.onSetQuestions(localQuestions)
    })

    // This call is the local edit we just applied
    expect(setQuestionsMock).toHaveBeenCalledTimes(2)
    expect(setQuestionsMock.mock.calls[1]?.[0]).toEqual(localQuestions)

    // Re-render should NOT trigger a new hydration back to loadedQuestions
    rerender(<QuizCreatorPage />)
    await flushPromises()

    expect(setQuestionsMock).toHaveBeenCalledTimes(2)
    expect(latestUIProps?.questions).toEqual(localQuestions)
  })

  it('rehydrates questions when quizId changes', async () => {
    mockQuizQueryState = {
      data: {
        mode: GameMode.Classic,
        title: 'Loaded title',
        visibility: QuizVisibility.Public,
        category: QuizCategory.Other,
        languageCode: LanguageCode.English,
      },
      isLoading: false,
      isError: false,
    }

    const questionsQuiz1 = [{ id: 'q1' }]
    const questionsQuiz2 = [{ id: 'q2' }]

    mockQuizId = 'quiz-1'
    mockQuestionsQueryState = {
      data: questionsQuiz1,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: true,
    }

    const { rerender } = render(<QuizCreatorPage />)
    await flushPromises()

    expect(setQuestionsMock).toHaveBeenCalledTimes(1)
    expect(setQuestionsMock.mock.calls[0]?.[0]).toBe(questionsQuiz1)

    // Switch quizId + query payload
    mockQuizId = 'quiz-2'
    mockQuestionsQueryState = {
      data: questionsQuiz2,
      isLoading: false,
      isError: false,
      isFetchedAfterMount: true,
    }

    // Render once to trigger the [quizId] ref-reset effect
    rerender(<QuizCreatorPage />)
    await flushPromises()

    // Render again so the hydrate effect runs with didHydrateQuestionsRef=false
    rerender(<QuizCreatorPage />)
    await flushPromises()

    expect(setQuestionsMock).toHaveBeenCalledTimes(2)
    expect(setQuestionsMock.mock.calls[1]?.[0]).toBe(questionsQuiz2)
  })
})
