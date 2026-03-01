import {
  type DiscoverySectionDto,
  DiscoverySectionKey,
  GameMode,
  LanguageCode,
  QuizCategory,
} from '@klurigo/common'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import DiscoverRailsPageUI from './DiscoverRailsPageUI'

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../../../../context/auth', () => ({
  useAuthContext: () => ({
    isUserAuthenticated: true,
    revokeUser: vi.fn(),
  }),
}))

const makeSections = (count: number): DiscoverySectionDto[] =>
  Array.from({ length: count }, (_, i) => ({
    key: Object.values(DiscoverySectionKey)[i % 6],
    title: `Section ${i + 1}`,
    description: `Description ${i + 1}`,
    quizzes: [
      {
        id: `q-${i}`,
        title: `Quiz ${i}`,
        description: 'A quiz',
        imageCoverURL: `https://example.com/${i}.jpg`,
        category: QuizCategory.Science,
        languageCode: LanguageCode.English,
        mode: GameMode.Classic,
        numberOfQuestions: 10,
        author: { id: 'a1', name: 'Author' },
        gameplaySummary: {
          count: 5,
          totalPlayerCount: 10,
        },
        ratingSummary: { stars: 4.0, comments: 2 },
        created: new Date(),
      },
    ],
  }))

describe('DiscoverRailsPageUI', () => {
  it('renders the correct number of sections', () => {
    const sections = makeSections(3)

    render(
      <MemoryRouter>
        <DiscoverRailsPageUI sections={sections} isLoading={false} />
      </MemoryRouter>,
    )

    const railSections = screen.getAllByTestId('discovery-rail-section')
    expect(railSections).toHaveLength(3)
  })

  it('renders page title', () => {
    render(
      <MemoryRouter>
        <DiscoverRailsPageUI sections={[]} isLoading={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Discover' }),
    ).toBeInTheDocument()
  })

  it('renders empty state when sections is empty', () => {
    render(
      <MemoryRouter>
        <DiscoverRailsPageUI sections={[]} isLoading={false} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('empty-state')).toHaveTextContent(
      'More quizzes coming soon — check back later!',
    )
  })

  it('renders skeleton sections when loading', () => {
    render(
      <MemoryRouter>
        <DiscoverRailsPageUI sections={[]} isLoading={true} />
      </MemoryRouter>,
    )

    const skeletonCards = screen.getAllByTestId('skeleton-card')
    expect(skeletonCards.length).toBeGreaterThan(0)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })

  it('does not render empty state when sections have data', () => {
    const sections = makeSections(2)

    render(
      <MemoryRouter>
        <DiscoverRailsPageUI sections={sections} isLoading={false} />
      </MemoryRouter>,
    )

    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })
})
