import { GameTokenDto, TokenDto, TokenScope, TokenType } from '@quiz/common'
import { jwtDecode } from 'jwt-decode'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMounted, useLocalStorage } from 'usehooks-ts'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { AuthState, ScopePayload } from '../../models'

import { AuthContext, AuthContextType } from './auth-context.tsx'

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
        revoke({ token }, scope).then(() => {
          clearAuthState(scope)
          navigate('/')
        })
      }
    },
    [authState, clearAuthState, revoke, navigate],
  )

  /**
   * Tracks whether the component is still mounted.
   * Used to avoid updating state after unmount in async flows.
   */
  const isMounted = useIsMounted()

  /**
   * In-flight guard for the token refresh request.
   * Prevents multiple simultaneous refresh calls.
   */
  const isRefreshingUserToken = useRef<boolean>(false)

  /**
   * Refresh the user access token when:
   * - no access token exists OR it has expired, AND
   * - a refresh token exists AND is still valid.
   */
  useEffect(() => {
    if (!isMounted()) return

    const currentTimeSec = Math.floor(Date.now() / 1000)

    const needsAccessRefresh =
      (!authState.USER?.ACCESS || authState.USER.ACCESS.exp < currentTimeSec) &&
      !!authState.USER?.REFRESH &&
      authState.USER.REFRESH.exp > currentTimeSec

    if (!isRefreshingUserToken.current && needsAccessRefresh) {
      isRefreshingUserToken.current = true
      console.log('refreshing user token')

      refresh(TokenScope.User, { refreshToken: authState.USER!.REFRESH!.token })
        .then((response) => {
          console.log('refreshed user token')
          handleSetTokenPair(
            TokenScope.User,
            response.accessToken,
            response.refreshToken,
          )
        })
        .finally(() => {
          isRefreshingUserToken.current = false
        })
    }
  }, [isMounted, authState, handleSetTokenPair, refresh])

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
