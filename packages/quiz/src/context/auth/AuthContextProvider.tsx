import type { GameTokenDto, TokenDto } from '@quiz/common'
import { TokenScope, TokenType } from '@quiz/common'
import { jwtDecode } from 'jwt-decode'
import type { FC, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMounted, useLocalStorage } from 'usehooks-ts'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import type { AuthState, ScopePayload } from '../../models'

import type { AuthContextType } from './auth-context.tsx'
import { AuthContext } from './auth-context.tsx'

/**
 * Props for the `AuthContextProvider` component.
 *
 * @property children - The child components to be wrapped by the provider.
 */
export interface AuthContextProviderProps {
  children: ReactNode | ReactNode[]
}

/**
 * A context provider for managing authentication-related state.
 *
 * It synchronizes the context state with local storage and provides functions to update
 * and persist authentication data.
 *
 * @param children - The child components to be wrapped by the provider.
 * @returns A React component wrapping its children with the `AuthContext` provider.
 */
const AuthContextProvider: FC<AuthContextProviderProps> = ({ children }) => {
  /**
   * revoke() — function from useQuizServiceClient for invalidating
   * an access or refresh token on the server.
   */
  const { revoke, refresh } = useQuizServiceClient()

  /**
   * Navigation function from react-router for programmatic route changes.
   */
  const navigate = useNavigate()

  /**
   * In-memory store of decoded token payloads per TokenScope and TokenType.
   */
  const [authState, setAuthState] = useLocalStorage<AuthState>('auth', {
    USER: undefined,
    GAME: undefined,
  })

  /**
   * `true` if there is a valid token pair in the User scope.
   */
  const isUserAuthenticated = useMemo(() => !!authState.USER, [authState])

  /**
   * `true` if there is a valid token pair in the Game scope.
   */
  const isGameAuthenticated = useMemo(() => !!authState.GAME, [authState])

  /**
   * Decodes a User-scope JWT into its typed payload.
   *
   * @param token - The raw JWT string to decode.
   * @returns The `ScopePayload<TokenScope.User>` containing sub, exp, authorities, and token.
   */
  const decodeUserScopeTokenPayload = (
    token: string,
  ): ScopePayload<TokenScope.User> => {
    const { sub, exp, authorities } = jwtDecode<TokenDto>(token)
    return {
      sub,
      exp,
      authorities,
      token,
    }
  }

  /**
   * Decodes a Game-scope JWT into its typed payload (including gameId and participantType).
   *
   * @param token - The raw JWT string to decode.
   * @returns The `ScopePayload<TokenScope.Game>` containing sub, exp, authorities, gameId, participantType, and token.
   */
  const decodeGameScopeTokenPayload = (
    token: string,
  ): ScopePayload<TokenScope.Game> => {
    const { sub, exp, authorities, gameId, participantType } =
      jwtDecode<GameTokenDto>(token)
    return {
      sub,
      exp,
      authorities,
      token,
      gameId,
      participantType,
    }
  }

  /**
   * Stores a new access/refresh token pair for the given scope.
   *
   * Decodes each token and updates authState.
   *
   * @param scope - The TokenScope to update (User or Game).
   * @param accessToken - The new access token string.
   * @param refreshToken - The new refresh token string.
   */
  const handleSetTokenPair = useCallback(
    (scope: TokenScope, accessToken: string, refreshToken: string) => {
      setAuthState((prevState) => {
        const modifiedAuthState = { ...prevState }
        if (scope === TokenScope.User) {
          modifiedAuthState.USER = {
            [TokenType.Access]: decodeUserScopeTokenPayload(accessToken),
            [TokenType.Refresh]: decodeUserScopeTokenPayload(refreshToken),
          }
        }
        if (scope === TokenScope.Game) {
          modifiedAuthState.GAME = {
            [TokenType.Access]: decodeGameScopeTokenPayload(accessToken),
            [TokenType.Refresh]: decodeGameScopeTokenPayload(refreshToken),
          }
        }
        return modifiedAuthState
      })
    },
    [setAuthState],
  )

  /**
   * Clears all tokens for the specified TokenScope from authState.
   *
   * @param scope - The TokenScope to clear (User or Game).
   */
  const clearAuthState = useCallback(
    (scope: TokenScope) => {
      setAuthState((prevState) => {
        const modifiedAuthState = { ...prevState }
        if (scope === TokenScope.User) {
          modifiedAuthState.USER = undefined
        }
        if (scope === TokenScope.Game) {
          modifiedAuthState.GAME = undefined
        }
        return modifiedAuthState
      })
    },
    [setAuthState],
  )

  /**
   * Revokes the authentication token for the given scope via the API,
   * then clears it from state and navigates home.
   *
   * @param scope - The TokenScope whose tokens should be revoked.
   */
  const revokeAuthToken = useCallback(
    (scope: TokenScope) => {
      const token =
        authState[scope]?.ACCESS.token || authState[scope]?.REFRESH.token
      if (token) {
        revoke({ token }, scope)
          .catch(() => {
            // swallow exception
          })
          .finally(() => {
            clearAuthState(scope)
            navigate('/')
          })
      }
    },
    [authState, clearAuthState, revoke, navigate],
  )

  /**
   * Converts an epoch expiration value to seconds.
   * Accepts either seconds or milliseconds and normalizes to seconds.
   *
   * @param exp - Epoch timestamp in seconds or milliseconds.
   * @returns The expiration time in seconds, or `undefined` if input is falsy.
   */
  const toSec = (exp?: number) =>
    !exp ? undefined : exp > 1_000_000_000_000 ? Math.floor(exp / 1000) : exp // ms→s if needed

  /**
   * Allowed clock skew in seconds when evaluating token expiration.
   * Prevents premature refresh attempts caused by small client–server time differences.
   */
  const SKEW_SEC = 5 // tolerate small clock skew

  /**
   * Minimum delay between refresh attempts, in milliseconds.
   * Avoids hammering the backend during transient failures or race conditions.
   */
  const COOLDOWN_MS = 10_000 // avoid hammering on transient errors

  /**
   * Tracks whether the component is still mounted.
   * Used to avoid updating state after unmount in async flows.
   */
  const isMounted = useIsMounted()

  /**
   * In-flight guard & dedupe/cooldown.
   *
   * - `isRefreshingUserToken` prevents concurrent refresh calls.
   * - `lastRefreshTokenTriedRef` dedupes attempts for the same refresh token value.
   * - `lastAttemptAtRef` enforces a short cooldown between attempts.
   */
  const isRefreshingUserToken = useRef(false)
  const lastRefreshTokenTriedRef = useRef<string | null>(null)
  const lastAttemptAtRef = useRef<number>(0)

  /**
   * Refreshes the **user** access token when:
   *  - The access token is missing or expired (with a small skew tolerance), **and**
   *  - A refresh token exists and is still valid.
   *
   * Safety features:
   *  - Converts expiration units to seconds to avoid ms/sec mismatches.
   *  - Dedupe: avoids retrying with the same refresh token until state changes.
   *  - Cooldown: throttles attempts to prevent backend hammering.
   *
   * Dependencies are narrowed to only the specific token fields used in the decision,
   * plus `refresh` and `handleSetTokenPair`, to avoid unnecessary re-runs.
   */
  useEffect(() => {
    if (!isMounted()) return

    const accessExpSec = toSec(authState.USER?.ACCESS?.exp)
    const refreshExpSec = toSec(authState.USER?.REFRESH?.exp)
    const refreshToken = authState.USER?.REFRESH?.token

    const nowSec = Math.floor(Date.now() / 1000)

    const accessMissingOrExpired =
      !authState.USER?.ACCESS || (accessExpSec ?? 0) <= nowSec + SKEW_SEC
    const hasValidRefresh =
      !!refreshToken && (refreshExpSec ?? 0) > nowSec + SKEW_SEC

    const needsAccessRefresh = accessMissingOrExpired && hasValidRefresh

    if (!needsAccessRefresh) return

    const nowMs = Date.now()
    const coolingDown = nowMs - lastAttemptAtRef.current < COOLDOWN_MS
    const alreadyTriedThisToken =
      lastRefreshTokenTriedRef.current === refreshToken

    if (isRefreshingUserToken.current || coolingDown || alreadyTriedThisToken)
      return

    isRefreshingUserToken.current = true
    lastAttemptAtRef.current = nowMs
    lastRefreshTokenTriedRef.current = refreshToken

    refresh(TokenScope.User, { refreshToken })
      .then((response) => {
        if (!isMounted()) return
        handleSetTokenPair(
          TokenScope.User,
          response.accessToken,
          response.refreshToken,
        )
        lastRefreshTokenTriedRef.current = null
      })
      .finally(() => {
        isRefreshingUserToken.current = false
      })
  }, [isMounted, authState, refresh, handleSetTokenPair])

  /**
   * Memoized value for the `AuthContext`, containing the current authentication state
   * and update functions.
   */
  const value = useMemo<AuthContextType>(
    () => ({
      user: authState.USER,
      game: authState.GAME,
      isUserAuthenticated,
      isGameAuthenticated,
      setTokenPair: handleSetTokenPair,
      revokeUser: () => revokeAuthToken(TokenScope.User),
      revokeGame: () => revokeAuthToken(TokenScope.Game),
    }),
    [
      authState,
      isUserAuthenticated,
      isGameAuthenticated,
      handleSetTokenPair,
      revokeAuthToken,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
