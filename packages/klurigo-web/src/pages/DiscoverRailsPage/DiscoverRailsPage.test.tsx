import {
  DiscoverySectionKey,
  GameMode,
  LanguageCode,
  QuizCategory,
} from '@klurigo/common'
import type { DiscoveryResponseDto } from '@klurigo/common'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  getDiscoveryMock: vi.fn(),
}))

vi.mock('../../api', () => ({
  useKlurigoServiceClient: () => ({ getDiscovery: h.getDiscoveryMock }),
}))

vi.mock('../../context/auth', () => ({
  useAuthContext: () => ({
    isUserAuthenticated: true,
    revokeUser: vi.fn(),
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

import DiscoverRailsPage from './DiscoverRailsPage'

const mockResponse: DiscoveryResponseDto = {
  sections: [
    {
      key: DiscoverySectionKey.FEATURED,
      title: 'Featured',
      description: 'Top picks',
      quizzes: [
        {
          id: 'q1',
          title: 'Test Quiz',
          description: 'A quiz',
          imageCoverURL: 'https://example.com/img.jpg',
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
    },
  ],
  generatedAt: new Date(),
}

describe('DiscoverRailsPage', () => {
  beforeEach(() => {
    h.getDiscoveryMock.mockReset()
  })

  it('renders sections after loading', async () => {
    h.getDiscoveryMock.mockResolvedValue(mockResponse)

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiscoverRailsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Featured')).toBeInTheDocument()
    })

    expect(h.getDiscoveryMock).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when API returns no sections', async () => {
    h.getDiscoveryMock.mockResolvedValue({
      sections: [],
      generatedAt: null,
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiscoverRailsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
  })
})
