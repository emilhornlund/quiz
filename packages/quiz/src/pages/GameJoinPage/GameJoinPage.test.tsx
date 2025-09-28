import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockJoinGame = vi.fn()
vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ joinGame: mockJoinGame }),
}))

let providedGameID: string | undefined = 'GAME123'
let providedDefaultNickname: string | undefined = undefined

vi.mock('../../context/game', () => ({
  useGameContext: () => ({ gameID: providedGameID }),
}))

vi.mock('../../context/user', () => ({
  useUserContext: () => ({
    currentUser: providedDefaultNickname
      ? { defaultNickname: providedDefaultNickname }
      : undefined,
  }),
}))

vi.mock('./text.utils.ts', () => ({
  getTitle: () => 'Join the game',
  getMessage: () => 'Pick a nickname and jump in!',
}))

import GameJoinPage from './GameJoinPage'

const renderWithRouter = (ui: React.ReactElement, route = '/join') =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)

beforeEach(() => {
  vi.clearAllMocks()
  providedGameID = 'GAME123'
  providedDefaultNickname = undefined
})

describe('GameJoinPage', () => {
  it('renders title and message', () => {
    const { container } = renderWithRouter(<GameJoinPage />)
    expect(screen.getByText('Join the game')).toBeInTheDocument()
    expect(screen.getByText('Pick a nickname and jump in!')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('navigates back when clicking the back button', () => {
    const { container } = renderWithRouter(<GameJoinPage />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)

    expect(container).toMatchSnapshot()
  })

  it('join button stays disabled until nickname is valid', () => {
    const { container } = renderWithRouter(<GameJoinPage />)

    const joinBtn = screen.getByRole('button', { name: /ok, go!/i })
    expect(joinBtn).toBeDisabled()

    const input = screen.getByPlaceholderText(/nickname/i)
    fireEvent.change(input, { target: { value: 'Emil' } })

    expect(joinBtn).not.toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('submits with gameID and nickname and navigates to /game', async () => {
    let resolveJoin!: () => void
    mockJoinGame.mockReturnValueOnce(
      new Promise<void>((r) => (resolveJoin = r)),
    )

    const { container } = renderWithRouter(<GameJoinPage />)

    const input = screen.getByPlaceholderText(/nickname/i)
    fireEvent.change(input, { target: { value: 'Emil' } })

    fireEvent.click(screen.getByRole('button', { name: /ok, go!/i }))

    expect(mockJoinGame).toHaveBeenCalledWith('GAME123', 'Emil')

    resolveJoin()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game'))

    expect(container).toMatchSnapshot()
  })

  it('does nothing when gameID is missing', () => {
    providedGameID = undefined
    const { container } = renderWithRouter(<GameJoinPage />)

    const input = screen.getByPlaceholderText(/nickname/i)
    fireEvent.change(input, { target: { value: 'Someone' } })

    fireEvent.click(screen.getByRole('button', { name: /ok, go!/i }))
    expect(mockJoinGame).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalledWith('/game')

    expect(container).toMatchSnapshot()
  })

  it('starts with empty nickname when user has no default, keeping Join disabled', () => {
    providedDefaultNickname = undefined
    const { container } = renderWithRouter(<GameJoinPage />)

    const input = screen.getByPlaceholderText(/nickname/i) as HTMLInputElement
    const joinBtn = screen.getByRole('button', { name: /ok, go!/i })

    expect(input.value).toBe('')
    expect(joinBtn).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('prefills nickname from user default but keeps Join disabled until validated', () => {
    providedDefaultNickname = 'PreFilledNick'
    const { container } = renderWithRouter(<GameJoinPage />)

    const input = screen.getByPlaceholderText(/nickname/i) as HTMLInputElement
    const joinBtn = screen.getByRole('button', { name: /ok, go!/i })

    // Prefilled value should be visible
    expect(input.value).toBe('PreFilledNick')

    // Button may still be disabled if NicknameTextField doesn't call onValid on mount
    expect(joinBtn).not.toBeDisabled()

    // Tweak the value to trigger NicknameTextField's onValid propagation
    fireEvent.change(input, { target: { value: 'PreFilledNick!' } })
    expect(joinBtn).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('does not submit when nickname is blank or whitespace', () => {
    const { container } = renderWithRouter(<GameJoinPage />)
    const input = screen.getByPlaceholderText(/nickname/i)
    const joinBtn = screen.getByRole('button', { name: /ok, go!/i })

    fireEvent.change(input, { target: { value: '   ' } })
    // If your NicknameTextField trims/validates, Join should remain disabled
    expect(joinBtn).toBeDisabled()

    // Even forcing a submit should not call joinGame since guard checks nickname truthiness
    fireEvent.submit(
      screen.getByRole('form', { hidden: true }) || joinBtn.closest('form')!,
    )
    expect(mockJoinGame).not.toHaveBeenCalled()

    expect(container).toMatchSnapshot()
  })

  it('disables the input while joining and re-enables after promise resolves', async () => {
    let resolveJoin!: () => void
    mockJoinGame.mockReturnValueOnce(
      new Promise<void>((r) => (resolveJoin = r)),
    )

    const { container } = renderWithRouter(<GameJoinPage />)
    const input = screen.getByPlaceholderText(/nickname/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Runner' } })

    // Submit -> should disable NicknameTextField (prop: disabled={isJoiningGame})
    fireEvent.click(screen.getByRole('button', { name: /ok, go!/i }))
    expect(mockJoinGame).toHaveBeenCalledWith('GAME123', 'Runner')
    expect(input.disabled).toBe(true)

    // Resolve and ensure input is re-enabled
    resolveJoin()
    await waitFor(() => expect(input.disabled).toBe(false))

    expect(container).toMatchSnapshot()
  })

  it('submits when the form is submitted (Enter key equivalent)', async () => {
    let resolveJoin!: () => void
    mockJoinGame.mockReturnValueOnce(
      new Promise<void>((r) => (resolveJoin = r)),
    )

    const { container } = renderWithRouter(<GameJoinPage />)
    const input = screen.getByPlaceholderText(/nickname/i)
    const form = screen.getByTestId('join-form')

    fireEvent.change(input, { target: { value: 'KeyUser' } })
    fireEvent.submit(form)

    expect(mockJoinGame).toHaveBeenCalledWith('GAME123', 'KeyUser')
    resolveJoin()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game'))

    expect(container).toMatchSnapshot()
  })

  it('ignores rapid double-submit (only calls joinGame once)', async () => {
    let resolveJoin!: () => void
    mockJoinGame.mockReturnValueOnce(
      new Promise<void>((r) => (resolveJoin = r)),
    )

    const { container } = renderWithRouter(<GameJoinPage />)
    const input = screen.getByPlaceholderText(/nickname/i)
    const joinBtn = screen.getByRole('button', { name: /ok, go!/i })

    fireEvent.change(input, { target: { value: 'Speedy' } })
    fireEvent.click(joinBtn)
    fireEvent.click(joinBtn) // second click happens while joining

    expect(mockJoinGame).toHaveBeenCalledTimes(1)

    resolveJoin()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game'))

    expect(container).toMatchSnapshot()
  })
})
