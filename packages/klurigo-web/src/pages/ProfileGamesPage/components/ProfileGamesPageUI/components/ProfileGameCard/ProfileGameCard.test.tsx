import { GameMode, GameParticipantType, GameStatus } from '@klurigo/common'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ProfileGameCard from './ProfileGameCard'

const mockOnClick = vi.fn()

const makeGame = (overrides?: object) => ({
  id: 'game-1',
  name: 'Geography Quiz Game',
  mode: GameMode.Classic,
  status: GameStatus.Completed,
  imageCoverURL: 'https://example.com/cover.jpg',
  participantType: GameParticipantType.PLAYER,
  rank: 1,
  score: 9200,
  created: new Date(Date.now() - 1000 * 60 * 60 * 2),
  ...overrides,
})

describe('ProfileGameCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders game name', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard game={makeGame()} onClick={mockOnClick} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Geography Quiz Game')).toBeInTheDocument()
  })

  it('calls onClick with game id and status on click', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProfileGameCard game={makeGame()} onClick={mockOnClick} />
      </MemoryRouter>,
    )

    const card = screen.getByTestId('profile-game-card')
    await user.click(card)

    expect(mockOnClick).toHaveBeenCalledWith('game-1', GameStatus.Completed)
  })

  it('calls onClick on Enter key press', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProfileGameCard game={makeGame()} onClick={mockOnClick} />
      </MemoryRouter>,
    )

    const card = screen.getByTestId('profile-game-card')
    card.focus()
    await user.keyboard('{Enter}')

    expect(mockOnClick).toHaveBeenCalledWith('game-1', GameStatus.Completed)
  })

  it('calls onClick on Space key press', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProfileGameCard game={makeGame()} onClick={mockOnClick} />
      </MemoryRouter>,
    )

    const card = screen.getByTestId('profile-game-card')
    card.focus()
    await user.keyboard(' ')

    expect(mockOnClick).toHaveBeenCalledWith('game-1', GameStatus.Completed)
  })

  it('displays fallback icon when no cover image', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard
          game={makeGame({ imageCoverURL: undefined })}
          onClick={mockOnClick}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('cover-fallback')).toBeInTheDocument()
  })

  it('does not display fallback icon when cover image is provided', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard game={makeGame()} onClick={mockOnClick} />
      </MemoryRouter>,
    )

    expect(screen.queryByTestId('cover-fallback')).not.toBeInTheDocument()
  })

  it('shows score and rank for completed player game', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard
          game={makeGame({
            status: GameStatus.Completed,
            participantType: GameParticipantType.PLAYER,
            score: 9200,
            rank: 1,
          })}
          onClick={mockOnClick}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('info-rank')).toBeInTheDocument()
    expect(screen.getByTestId('info-score')).toBeInTheDocument()
    expect(screen.getByText('9200')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows Host status for completed host game', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard
          game={makeGame({
            status: GameStatus.Completed,
            participantType: GameParticipantType.HOST,
          })}
          onClick={mockOnClick}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('info-host')).toBeInTheDocument()
    expect(screen.getByText('Host')).toBeInTheDocument()
    expect(screen.queryByTestId('info-rank')).not.toBeInTheDocument()
    expect(screen.queryByTestId('info-score')).not.toBeInTheDocument()
  })

  it('shows Ongoing status for active game', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard
          game={makeGame({
            status: GameStatus.Active,
            participantType: GameParticipantType.PLAYER,
          })}
          onClick={mockOnClick}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('info-active')).toBeInTheDocument()
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
    expect(screen.queryByTestId('info-rank')).not.toBeInTheDocument()
    expect(screen.queryByTestId('info-score')).not.toBeInTheDocument()
  })

  it('shows game mode label', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard
          game={makeGame({ mode: GameMode.Classic })}
          onClick={mockOnClick}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Classic')).toBeInTheDocument()
  })

  it('shows time ago for date played', () => {
    render(
      <MemoryRouter>
        <ProfileGameCard
          game={makeGame({
            created: new Date(Date.now() - 1000 * 60 * 60 * 2),
          })}
          onClick={mockOnClick}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
  })
})
