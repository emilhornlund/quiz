import {
  type DiscoveryQuizCardDto,
  GameMode,
  LanguageCode,
  QuizCategory,
} from '@klurigo/common'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import QuizDiscoveryCard from './QuizDiscoveryCard'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const makeQuiz = (
  overrides?: Partial<DiscoveryQuizCardDto>,
): DiscoveryQuizCardDto => ({
  id: 'quiz-1',
  title: 'Test Quiz',
  description: 'A test quiz description',
  imageCoverURL: 'https://example.com/cover.jpg',
  category: QuizCategory.Science,
  languageCode: LanguageCode.English,
  mode: GameMode.Classic,
  numberOfQuestions: 15,
  author: { id: 'author-1', name: 'Jane Doe' },
  gameplaySummary: {
    count: 42,
    totalPlayerCount: 100,
  },
  ratingSummary: { stars: 4.5, comments: 10 },
  created: new Date(),
  ...overrides,
})

describe('QuizDiscoveryCard', () => {
  beforeEach(() => {
    navigateMock.mockReset()
  })

  it('renders quiz title, author, and meta info', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard quiz={makeQuiz()} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Test Quiz')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders cover image when imageCoverURL is provided', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard quiz={makeQuiz()} />
      </MemoryRouter>,
    )

    const img = screen.getByAltText('Test Quiz')
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('renders fallback when imageCoverURL is missing', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard quiz={makeQuiz({ imageCoverURL: undefined })} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('cover-fallback')).toBeInTheDocument()
  })

  it('does not render rating when stars is 0', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard
          quiz={makeQuiz({
            ratingSummary: { stars: 0, comments: 0 },
          })}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
  })

  it('navigates to quiz details on click', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard quiz={makeQuiz()} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('quiz-discovery-card'))
    expect(navigateMock).toHaveBeenCalledWith('/quiz/details/quiz-1')
  })

  it('navigates on Enter key press', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard quiz={makeQuiz()} />
      </MemoryRouter>,
    )

    fireEvent.keyDown(screen.getByTestId('quiz-discovery-card'), {
      key: 'Enter',
    })
    expect(navigateMock).toHaveBeenCalledWith('/quiz/details/quiz-1')
  })

  it('navigates on Space key press', () => {
    render(
      <MemoryRouter>
        <QuizDiscoveryCard quiz={makeQuiz()} />
      </MemoryRouter>,
    )

    fireEvent.keyDown(screen.getByTestId('quiz-discovery-card'), {
      key: ' ',
    })
    expect(navigateMock).toHaveBeenCalledWith('/quiz/details/quiz-1')
  })
})
