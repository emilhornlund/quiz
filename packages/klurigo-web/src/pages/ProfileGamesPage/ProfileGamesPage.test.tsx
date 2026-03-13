import type { PaginatedGameHistoryDto } from '@klurigo/common'
import { GameMode, GameParticipantType, GameStatus } from '@klurigo/common'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  getProfileGamesMock: vi.fn(),
  authenticateGameMock: vi.fn(),
  navigateMock: vi.fn(),
  useDeviceSizeTypeMock: vi.fn(),
}))

vi.mock('../../api', () => ({
  useKlurigoServiceClient: () => ({
    getProfileGames: h.getProfileGamesMock,
    authenticateGame: h.authenticateGameMock,
  }),
}))

vi.mock('../../utils/useDeviceSizeType', () => ({
  useDeviceSizeType: () => h.useDeviceSizeTypeMock(),
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
  return { ...actual, useNavigate: () => h.navigateMock }
})

import { DeviceType } from '../../utils/device-size.types'

import ProfileGamesPage from './ProfileGamesPage'

// Use a fixed date to avoid flaky relative-time assertions (e.g. "just now" vs "1 second ago")
const FIXED_DATE = new Date('2025-01-01T12:00:00.000Z')

const makeGame = (
  id: string,
  name: string,
  overrides?: object,
): PaginatedGameHistoryDto['results'][number] => ({
  id,
  name,
  mode: GameMode.Classic,
  status: GameStatus.Completed,
  imageCoverURL: undefined,
  participantType: GameParticipantType.PLAYER,
  rank: 1,
  score: 5000,
  created: FIXED_DATE,
  ...overrides,
})

const makePage = (
  results: PaginatedGameHistoryDto['results'],
  total: number,
  limit = 10,
  offset = 0,
): PaginatedGameHistoryDto => ({ results, total, limit, offset })

const renderProfileGamesPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfileGamesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProfileGamesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Mobile)
  })

  it('renders games with card layout on initial load', async () => {
    h.getProfileGamesMock.mockResolvedValue(
      makePage([makeGame('g1', 'Game 1'), makeGame('g2', 'Game 2')], 5),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Game 2')).toBeInTheDocument()
    expect(screen.getByTestId('profile-game-grid')).toBeInTheDocument()
    expect(h.getProfileGamesMock).toHaveBeenCalledWith({ limit: 10, offset: 0 })
  })

  it('clicking "Load more games" triggers another API request and appends results', async () => {
    h.getProfileGamesMock.mockResolvedValueOnce(
      makePage([makeGame('g1', 'Game 1'), makeGame('g2', 'Game 2')], 5),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    h.getProfileGamesMock.mockResolvedValueOnce(
      makePage([makeGame('g3', 'Game 3'), makeGame('g4', 'Game 4')], 5, 10, 2),
    )

    await userEvent.click(
      screen.getByTestId('test-load-more-games-button-button'),
    )

    await waitFor(() => {
      expect(screen.getByText('Game 3')).toBeInTheDocument()
    })

    expect(screen.getByText('Game 1')).toBeInTheDocument()
    expect(screen.getByText('Game 2')).toBeInTheDocument()
    expect(screen.getByText('Game 4')).toBeInTheDocument()
    expect(h.getProfileGamesMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 2 }),
    )
  })

  it('shows the loading-more state while another page is being fetched', async () => {
    h.getProfileGamesMock.mockResolvedValueOnce(
      makePage([makeGame('g1', 'Game 1'), makeGame('g2', 'Game 2')], 5),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    let resolveNextPage!: (value: PaginatedGameHistoryDto) => void
    const nextPage = new Promise<PaginatedGameHistoryDto>((resolve) => {
      resolveNextPage = resolve
    })
    h.getProfileGamesMock.mockReturnValueOnce(nextPage)

    const loadMoreButton = screen.getByTestId(
      'test-load-more-games-button-button',
    )
    await userEvent.click(loadMoreButton)

    await waitFor(() => {
      expect(h.getProfileGamesMock).toHaveBeenLastCalledWith({
        limit: 10,
        offset: 2,
      })
    })

    expect(loadMoreButton).toBeDisabled()
    expect(screen.getByText('Game 1')).toBeInTheDocument()

    resolveNextPage(
      makePage([makeGame('g3', 'Game 3'), makeGame('g4', 'Game 4')], 5, 10, 2),
    )

    await waitFor(() => {
      expect(screen.getByText('Game 3')).toBeInTheDocument()
    })
  })

  it('"Load more games" button disappears when all games are loaded', async () => {
    h.getProfileGamesMock.mockResolvedValue(
      makePage([makeGame('g1', 'Game 1'), makeGame('g2', 'Game 2')], 2),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    expect(
      screen.queryByTestId('test-load-more-games-button-button'),
    ).not.toBeInTheDocument()
  })

  it('clicking an active game calls authenticateGame and navigates to /game on success', async () => {
    h.getProfileGamesMock.mockResolvedValue(
      makePage(
        [makeGame('g1', 'Active Game', { status: GameStatus.Active })],
        1,
      ),
    )
    h.authenticateGameMock.mockResolvedValue(undefined)

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Active Game')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('profile-game-card'))

    await waitFor(() => {
      expect(h.authenticateGameMock).toHaveBeenCalledWith({ gameId: 'g1' })
      expect(h.navigateMock).toHaveBeenCalledWith('/game')
    })
  })

  it('does not navigate when active game authentication fails', async () => {
    h.getProfileGamesMock.mockResolvedValue(
      makePage(
        [makeGame('g1', 'Active Game', { status: GameStatus.Active })],
        1,
      ),
    )
    h.authenticateGameMock.mockRejectedValue(new Error('Unauthorized'))

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Active Game')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('profile-game-card'))

    await waitFor(() => {
      expect(h.authenticateGameMock).toHaveBeenCalledWith({ gameId: 'g1' })
    })

    expect(h.navigateMock).not.toHaveBeenCalled()
  })

  it('clicking a completed game navigates to /game/results/{id}', async () => {
    h.getProfileGamesMock.mockResolvedValue(
      makePage([makeGame('g1', 'Completed Game')], 1),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Completed Game')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('profile-game-card'))

    expect(h.navigateMock).toHaveBeenCalledWith('/game/results/g1')
  })

  it('shows skeletons during initial loading state and removes them once loaded', async () => {
    let resolveLoad!: (value: PaginatedGameHistoryDto) => void
    const deferred = new Promise<PaginatedGameHistoryDto>((resolve) => {
      resolveLoad = resolve
    })
    h.getProfileGamesMock.mockReturnValue(deferred)

    renderProfileGamesPage()

    expect(screen.getAllByTestId('profile-game-card-skeleton')).toHaveLength(10)
    expect(screen.queryByTestId('profile-game-card')).not.toBeInTheDocument()

    resolveLoad(
      makePage([makeGame('g1', 'Game 1'), makeGame('g2', 'Game 2')], 2),
    )

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    expect(
      screen.queryByTestId('profile-game-card-skeleton'),
    ).not.toBeInTheDocument()
  })

  it('uses correct pagination limit for Mobile device (10 items)', async () => {
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Mobile)
    h.getProfileGamesMock.mockResolvedValue(
      makePage([makeGame('g1', 'Game 1')], 1),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    expect(h.getProfileGamesMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 0 }),
    )
  })

  it('uses correct pagination limit for Tablet device (15 items)', async () => {
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Tablet)
    h.getProfileGamesMock.mockResolvedValue(
      makePage([makeGame('g1', 'Game 1')], 1),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    expect(h.getProfileGamesMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 15, offset: 0 }),
    )
  })

  it('uses correct pagination limit for Desktop device (20 items)', async () => {
    h.useDeviceSizeTypeMock.mockReturnValue(DeviceType.Desktop)
    h.getProfileGamesMock.mockResolvedValue(
      makePage([makeGame('g1', 'Game 1')], 1),
    )

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeInTheDocument()
    })

    expect(h.getProfileGamesMock).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, offset: 0 }),
    )
  })

  it('shows error state on API failure', async () => {
    h.getProfileGamesMock.mockRejectedValue(new Error('API Error'))

    renderProfileGamesPage()

    await waitFor(() => {
      expect(
        screen.getByTestId('profile-games-empty-state'),
      ).toBeInTheDocument()
    })
  })

  it('shows empty state when no games exist', async () => {
    h.getProfileGamesMock.mockResolvedValue(makePage([], 0))

    renderProfileGamesPage()

    await waitFor(() => {
      expect(screen.getByText('No Games Yet')).toBeInTheDocument()
    })
  })
})
