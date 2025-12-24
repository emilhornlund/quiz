import { TokenScope, TokenType } from '@quiz/common'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { useContext, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from './auth-context'
import AuthContextProvider from './AuthContextProvider'

// --- Mocks ---
const mockRevoke = vi.fn().mockResolvedValue({})
vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ revoke: mockRevoke }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await importActual<any>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockJwtDecode = vi.fn()
// Keep the payload shape simple; we just need to see it flow through.
vi.mock('jwt-decode', () => ({
  jwtDecode: (token: string) =>
    mockJwtDecode(token) ??
    ({
      sub: `sub:${token}`,
      exp: 123,
      authorities: ['ROLE_USER'],
      // optional fields for game scope:
      gameId: token.includes('game') ? 'game-123' : undefined,
      participantType: token.includes('game') ? 'Player' : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
}))

// --- Test helpers ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderWithProvider(capture: (ctx: any) => void, ui?: React.ReactNode) {
  const Probe: React.FC = () => {
    const ctx = useContext(AuthContext)
    useEffect(() => {
      capture(ctx)
    }, [ctx])
    return ui ?? null
  }
  return render(
    <BrowserRouter>
      <AuthContextProvider>
        <Probe />
      </AuthContextProvider>
    </BrowserRouter>,
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setLocalStorageAuth(state: any) {
  localStorage.setItem('auth', JSON.stringify(state))
}

// --- Lifecycle ---
beforeEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  mockRevoke.mockClear()
  mockNavigate.mockClear()
  mockJwtDecode.mockClear()
})

afterEach(() => {
  cleanup()
})

// --- Tests ---
describe('AuthContextProvider', () => {
  it('initializes from localStorage on first render (no flicker)', async () => {
    // Pre-populate localStorage with a USER token so the first render is authenticated
    setLocalStorageAuth({
      USER: {
        [TokenType.Access]: { token: 'user.access', exp: 1 },
        [TokenType.Refresh]: { token: 'user.refresh', exp: 2 },
      },
      GAME: undefined,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await waitFor(() => {
      expect(ctx).toBeTruthy()
      expect(ctx.isUserAuthenticated).toBe(true)
      expect(ctx.isGameAuthenticated).toBe(false)
      expect(ctx.user?.ACCESS.token).toBe('user.access')
    })

    expect(container).toMatchSnapshot()
  })

  it('starts unauthenticated when localStorage is empty', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await waitFor(() => {
      expect(ctx.isUserAuthenticated).toBe(false)
      expect(ctx.isGameAuthenticated).toBe(false)
      expect(ctx.user).toBeUndefined()
      expect(ctx.game).toBeUndefined()
    })

    expect(container).toMatchSnapshot()
  })

  it('setTokenPair(User) decodes tokens and persists to localStorage', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await act(async () => {
      ctx.setTokenPair(TokenScope.User, 'user.access.jwt', 'user.refresh.jwt')
    })

    await waitFor(() => {
      // context updated
      expect(ctx.isUserAuthenticated).toBe(true)
      expect(ctx.user?.ACCESS.token).toBe('user.access.jwt')
      expect(ctx.user?.REFRESH.token).toBe('user.refresh.jwt')
      // persisted
      const parsed = JSON.parse(localStorage.getItem('auth')!)
      expect(parsed.USER.ACCESS.token).toBe('user.access.jwt')
      expect(parsed.USER.REFRESH.token).toBe('user.refresh.jwt')
    })

    expect(container).toMatchSnapshot()
  })

  it('setTokenPair(Game) decodes game fields and persists to localStorage', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await act(async () => {
      ctx.setTokenPair(TokenScope.Game, 'game.access.jwt', 'game.refresh.jwt')
    })

    await waitFor(() => {
      expect(ctx.isGameAuthenticated).toBe(true)
      expect(ctx.game?.ACCESS.token).toBe('game.access.jwt')
      expect(ctx.game?.REFRESH.token).toBe('game.refresh.jwt')
      // game extras from mocked decoder
      expect(ctx.game?.ACCESS.gameId).toBe('game-123')
      expect(ctx.game?.ACCESS.participantType).toBe('Player')
      // persisted
      const parsed = JSON.parse(localStorage.getItem('auth')!)
      expect(parsed.GAME.ACCESS.token).toBe('game.access.jwt')
    })

    expect(container).toMatchSnapshot()
  })

  it('clears per-scope auth with revokeUser/revokeGame (calls API, navigates, updates storage)', async () => {
    // seed both scopes
    setLocalStorageAuth({
      USER: {
        [TokenType.Access]: { token: 'u.acc', exp: 1 },
        [TokenType.Refresh]: { token: 'u.ref', exp: 2 },
      },
      GAME: {
        [TokenType.Access]: { token: 'g.acc', exp: 3 },
        [TokenType.Refresh]: { token: 'g.ref', exp: 4 },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    // revoke user first
    await act(async () => {
      await ctx.revokeUser()
    })

    await waitFor(() => {
      expect(mockRevoke).toHaveBeenCalledWith({ token: 'u.acc' }, 'USER') // access is preferred
      expect(mockNavigate).toHaveBeenCalledWith('/')
      expect(ctx.user).toBeUndefined()
      // game still present
      expect(ctx.game).toBeTruthy()
    })

    // revoke game next
    await act(async () => {
      await ctx.revokeGame()
    })

    await waitFor(() => {
      expect(mockRevoke).toHaveBeenCalledWith({ token: 'g.acc' }, 'GAME')
      expect(ctx.game).toBeUndefined()
      // storage cleared entirely when both scopes are empty
      expect(localStorage.getItem('auth')).toBe('{}')
    })

    expect(container).toMatchSnapshot()
  })

  it('removes storage entry when both scopes are cleared', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await act(async () => {
      ctx.setTokenPair(TokenScope.User, 'user.acc', 'user.ref')
      ctx.setTokenPair(TokenScope.Game, 'game.acc', 'game.ref')
    })
    expect(localStorage.getItem('auth')).toBeTruthy()

    await act(async () => {
      await ctx.revokeUser()
    })
    await act(async () => {
      await ctx.revokeGame()
    })

    await waitFor(() => {
      expect(localStorage.getItem('auth')).toBe('{}')
    })

    expect(container).toMatchSnapshot()
  })

  it('removes storage when the last remaining scope is cleared', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await act(async () => {
      ctx.setTokenPair(TokenScope.User, 'user.acc', 'user.ref')
    })
    expect(localStorage.getItem('auth')).toBeTruthy()

    await act(async () => {
      await ctx.revokeUser()
    })

    await waitFor(() => {
      expect(localStorage.getItem('auth')).toBe('{}')
    })

    expect(container).toMatchSnapshot()
  })

  it('revokeUser swallows errors and still clears & navigates', async () => {
    // seed user scope only
    setLocalStorageAuth({
      USER: {
        [TokenType.Access]: { token: 'u.acc', exp: 1 },
        [TokenType.Refresh]: { token: 'u.ref', exp: 2 },
      },
      GAME: undefined,
    })

    mockRevoke.mockRejectedValueOnce(new Error('boom'))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any
    const { container } = renderWithProvider((c) => (ctx = c))

    await act(async () => {
      await ctx.revokeUser()
    })

    await waitFor(() => {
      expect(mockRevoke).toHaveBeenCalledWith({ token: 'u.acc' }, 'USER')
      expect(mockNavigate).toHaveBeenCalledWith('/')
      expect(ctx.user).toBeUndefined()
      const persisted = JSON.parse(localStorage.getItem('auth') ?? '{}')
      expect(persisted.USER).toBeUndefined()
    })

    expect(container).toMatchSnapshot()
  })
})
