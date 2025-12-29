import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProfileGamesPage from './ProfileGamesPage'

const h = vi.hoisted(() => ({
  getProfileGames: vi.fn(),
  authenticateGame: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('../../api', () => ({
  useKlurigoServiceClient: () => ({
    getProfileGames: h.getProfileGames,
    authenticateGame: h.authenticateGame,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => h.navigateMock,
  }
})

function renderWithProviders(initialEntries: string[] = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<ProfileGamesPage />} />
          <Route path="/game" element={<div>GamePage</div>} />
          <Route
            path="/game/results/:id"
            element={<div>GameResultsPage</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileGamesPage', () => {
  it('shows spinner while loading and hides after success', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveFn: (v: any) => void
    const p = new Promise((res) => (resolveFn = res))
    h.getProfileGames.mockReturnValueOnce(p)
    renderWithProviders()
    expect(screen.getByTestId(/loading-spinner/i)).toBeInTheDocument()
    resolveFn!({ results: [], total: 0, limit: 5, offset: 0 })
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    )
  })

  it('calls getProfileGames with offset 0 and limit 5', async () => {
    h.getProfileGames.mockResolvedValueOnce({
      results: [],
      total: 0,
      limit: 5,
      offset: 0,
    })
    renderWithProviders()
    await waitFor(() => expect(h.getProfileGames).toHaveBeenCalled())
    expect(h.getProfileGames).toHaveBeenCalledWith({ offset: 0, limit: 5 })
  })

  it('derives offset from URL', async () => {
    h.getProfileGames.mockResolvedValueOnce({
      results: [],
      total: 0,
      limit: 5,
      offset: 10,
    })
    renderWithProviders(['/?offset=10'])
    await waitFor(() =>
      expect(h.getProfileGames).toHaveBeenCalledWith({ offset: 10, limit: 5 }),
    )
  })

  it('navigates to "/" on error', async () => {
    h.getProfileGames.mockRejectedValueOnce(new Error('boom'))
    renderWithProviders()
    await waitFor(() => expect(h.navigateMock).toHaveBeenCalledWith('/'))
  })
})
