import { GameMode, type GameResultDto, QuestionType } from '@quiz/common'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import GameResultsPage from './GameResultsPage'

const h = vi.hoisted(() => ({
  getGameResultsMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ getGameResults: h.getGameResultsMock }),
}))

vi.mock('../../context/auth', () => ({
  useAuthContext: () => ({
    user: {
      ACCESS: { sub: 'user-id-1' },
    },
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => h.navigateMock }
})

type ClassicResult = Extract<GameResultDto, { mode: GameMode.Classic }>
type Z2HResult = Extract<GameResultDto, { mode: GameMode.ZeroToOneHundred }>

const makeClassicResults = (name: string): ClassicResult => ({
  id: 'game-1',
  mode: GameMode.Classic,
  name,
  host: { id: 'host-1', nickname: 'Hosty' },
  playerMetrics: [
    {
      player: { id: 'p1', nickname: 'Alice' },
      rank: 1,
      correct: 2,
      incorrect: 1,
      unanswered: 0,
      averageResponseTime: 1500,
      longestCorrectStreak: 2,
      score: 200,
    },
    {
      player: { id: 'p2', nickname: 'Bob' },
      rank: 2,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      averageResponseTime: 2500,
      longestCorrectStreak: 1,
      score: 120,
    },
  ],
  questionMetrics: [
    {
      text: 'Q1: Capital of Sweden?',
      type: QuestionType.MultiChoice,
      correct: 2,
      incorrect: 0,
      unanswered: 0,
      averageResponseTime: 1800,
    },
    {
      text: 'Q2: 2 + 2?',
      type: QuestionType.TrueFalse,
      correct: 1,
      incorrect: 1,
      unanswered: 0,
      averageResponseTime: 2200,
    },
  ],
  duration: 300,
  created: new Date(),
})

const makeZ2HResults = (name: string): Z2HResult => ({
  id: 'game-1',
  mode: GameMode.ZeroToOneHundred,
  name,
  host: { id: 'host-1', nickname: 'Hosty' },
  playerMetrics: [
    {
      player: { id: 'p1', nickname: 'Carol' },
      rank: 1,
      averagePrecision: 0.8,
      unanswered: 0,
      averageResponseTime: 2100,
      longestCorrectStreak: 2,
      score: 10,
    },
    {
      player: { id: 'p2', nickname: 'Dave' },
      rank: 2,
      averagePrecision: 0.6,
      unanswered: 1,
      averageResponseTime: 2600,
      longestCorrectStreak: 1,
      score: 5,
    },
  ],
  questionMetrics: [
    {
      text: 'Q1: Estimate distance',
      type: QuestionType.Range,
      averagePrecision: 0.7,
      unanswered: 0,
      averageResponseTime: 3000,
    },
    {
      text: 'Q2: Estimate height',
      type: QuestionType.Range,
      averagePrecision: 0.5,
      unanswered: 1,
      averageResponseTime: 4000,
    },
  ],
  duration: 300,
  created: new Date(),
})

const renderWithProviders = (initialEntry: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/games/:gameID/results" element={<GameResultsPage />} />
          <Route path="/games/results" element={<GameResultsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  h.getGameResultsMock.mockReset()
  h.navigateMock.mockReset()
})

describe('GameResultsPage', () => {
  it('loads and renders results when query succeeds', async () => {
    const data = makeClassicResults('Classic Minimal')
    h.getGameResultsMock.mockResolvedValueOnce(data)
    const { container } = renderWithProviders('/games/game-1/results')
    await screen.findByText('Classic Minimal')
    expect(h.getGameResultsMock).toHaveBeenCalledWith('game-1')
    expect(h.navigateMock).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('shows loading before data resolves then renders UI', async () => {
    const data = makeZ2HResults('Deferred Load')
    let resolveFn: ((v: GameResultDto) => void) | null = null
    h.getGameResultsMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFn = resolve
      }),
    )
    const { container } = renderWithProviders('/games/game-2/results')
    expect(screen.queryByText('Deferred Load')).toBeNull()
    await act(async () => {
      resolveFn?.(data)
    })
    await screen.findByText('Deferred Load')
    expect(container).toMatchSnapshot()
  })

  it('navigates back on query error and keeps spinner', async () => {
    h.getGameResultsMock.mockRejectedValueOnce(new Error('boom'))
    const { container } = renderWithProviders('/games/game-3/results')
    await waitFor(() => expect(h.navigateMock).toHaveBeenCalledWith(-1))
    expect(h.getGameResultsMock).toHaveBeenCalledWith('game-3')
    expect(container).toMatchSnapshot()
  })

  it('does not query when gameID is missing', () => {
    const { container } = renderWithProviders('/games/results')
    expect(h.getGameResultsMock).not.toHaveBeenCalled()
    expect(h.navigateMock).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })
})
