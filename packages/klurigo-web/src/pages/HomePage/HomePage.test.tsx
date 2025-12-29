import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../api/api.utils.ts'

import HomePage from './HomePage'

const navigateMock = vi.fn()

const authContextMock = vi.fn()
vi.mock('../../context/auth', () => ({
  useAuthContext: () => authContextMock(),
}))

const quizServiceClientMock = vi.fn()
vi.mock('../../api', () => ({
  useKlurigoServiceClient: () => quizServiceClientMock(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../components', async () => {
  const actual =
    await vi.importActual<typeof import('../../components')>('../../components')

  return {
    ...actual,
    RotatingMessage: ({
      messages,
      renderMessage,
    }: {
      messages: string[]
      renderMessage?: (message: string) => React.ReactNode
    }) => {
      const message = messages[0] ?? ''
      if (!message) return null
      return (
        <div data-testid="rotating-message">
          {renderMessage ? renderMessage(message) : message}
        </div>
      )
    },
  }
})

const renderHome = () => {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    authContextMock.mockReturnValue({
      isUserAuthenticated: false,
      game: undefined,
      revokeGame: vi.fn(),
    })

    quizServiceClientMock.mockReturnValue({
      authenticateGame: vi.fn().mockResolvedValue(undefined),
    })
  })

  it('renders the base layout and the rotating message container', () => {
    const { container } = renderHome()

    expect(screen.getByText('Let’s play')).toBeInTheDocument()

    expect(screen.getByTestId('rotating-message')).toBeInTheDocument()
    expect(
      screen.getByText('Ready to show off your skills? Let’s go!'),
    ).toBeInTheDocument()

    expect(screen.getByPlaceholderText('Game PIN')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /join the game/i }),
    ).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('shows the login link when unauthenticated', () => {
    renderHome()

    expect(
      screen.getByRole('link', {
        name: /want to create your own quiz\? log in/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', {
        name: /create your own quiz and challenge others/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('shows the create quiz link when authenticated', () => {
    authContextMock.mockReturnValue({
      isUserAuthenticated: true,
      game: undefined,
      revokeGame: vi.fn(),
    })

    renderHome()

    expect(
      screen.getByRole('link', {
        name: /create your own quiz and challenge others/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', {
        name: /want to create your own quiz\? log in/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('does not render the "Resume game" button if there is no active game', () => {
    renderHome()

    expect(
      screen.queryByRole('button', { name: /resume game/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/jump back in where you left off/i),
    ).not.toBeInTheDocument()
  })

  it('renders the "Resume game" button if an active game exists', () => {
    authContextMock.mockReturnValue({
      isUserAuthenticated: false,
      game: {
        ACCESS: {
          gameId: 'game-123',
        },
      },
      revokeGame: vi.fn(),
    })

    const { container } = renderHome()

    expect(
      screen.getByRole('button', { name: /resume game/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/jump back in where you left off/i),
    ).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  it('clicking "Resume game" authenticates the game and navigates to /game on success', async () => {
    const authenticateGame = vi.fn().mockResolvedValue(undefined)

    authContextMock.mockReturnValue({
      isUserAuthenticated: false,
      game: {
        ACCESS: {
          gameId: 'game-123',
        },
      },
      revokeGame: vi.fn(),
    })

    quizServiceClientMock.mockReturnValue({ authenticateGame })

    renderHome()

    await userEvent.click(screen.getByRole('button', { name: /resume game/i }))

    await waitFor(() => {
      expect(authenticateGame).toHaveBeenCalledWith({ gameId: 'game-123' })
      expect(navigateMock).toHaveBeenCalledWith('/game')
    })
  })

  it('clicking "Resume game" revokes the game token on 401 ApiError', async () => {
    const revokeGame = vi.fn()
    const authenticateGame = vi
      .fn()
      .mockRejectedValue(new ApiError('Unauthorized', 401))

    authContextMock.mockReturnValue({
      isUserAuthenticated: false,
      game: {
        ACCESS: {
          gameId: 'game-123',
        },
      },
      revokeGame,
    })

    quizServiceClientMock.mockReturnValue({ authenticateGame })

    const preventUnhandled = (event: PromiseRejectionEvent) =>
      event.preventDefault()
    window.addEventListener('unhandledrejection', preventUnhandled)

    renderHome()

    await userEvent.click(screen.getByRole('button', { name: /resume game/i }))

    await waitFor(() => {
      expect(authenticateGame).toHaveBeenCalledWith({ gameId: 'game-123' })
      expect(revokeGame).toHaveBeenCalledTimes(1)
    })

    window.removeEventListener('unhandledrejection', preventUnhandled)
  })

  it('submitting the join form navigates to /auth/game?pin=... when a pin is present', async () => {
    renderHome()

    const input = screen.getByPlaceholderText('Game PIN') as HTMLInputElement
    await userEvent.type(input, '123456')

    const form = input.closest('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form as HTMLFormElement)

    expect(navigateMock).toHaveBeenCalledWith('/auth/game?pin=123456')
  })

  it('does not navigate on submit if the pin is empty', () => {
    renderHome()

    const input = screen.getByPlaceholderText('Game PIN') as HTMLInputElement
    const form = input.closest('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form as HTMLFormElement)

    expect(navigateMock).not.toHaveBeenCalled()
  })
})
