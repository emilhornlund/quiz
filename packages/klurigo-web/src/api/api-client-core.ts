import { TokenScope, TokenType } from '@klurigo/common'

import type { ApiPostBody } from './api.utils'
import {
  isTokenExpired,
  parseResponseAndHandleError,
  resolveUrl,
} from './api.utils'

/**
 * Per-request overrides for authentication and refresh behavior.
 *
 * Use this when a call needs a non-default token scope, when an endpoint provides a
 * one-time token (e.g. email verification), or when refresh must be disabled to avoid
 * recursion (e.g. `/auth/refresh`).
 */
export type FetchOptions = {
  /**
   * The token scope used to resolve tokens for the request.
   *
   * Defaults to `TokenScope.User`.
   */
  scope?: TokenScope

  /**
   * Explicit access token for this request.
   *
   * When provided, this bypasses token resolution from context and also disables
   * preemptive refresh based on local expiry checks.
   */
  token?: string

  /**
   * Controls whether the client should attempt refresh when:
   * - the current access token is locally detected as expired, or
   * - the server responds with HTTP 401 for a request that included an access token.
   *
   * Defaults to `true`.
   */
  refresh?: boolean
}

/**
 * Dependencies required by `createApiClientCore`.
 *
 * The API core is designed to be independent of React hooks and UI concerns:
 * - token storage is provided via `getToken` and `setTokenPair`
 * - user hydration is provided via `fetchCurrentUser`
 * - request execution can be overridden via `fetchImpl` for tests
 */
export type ApiClientCoreDeps = {
  /**
   * Returns the current token for the given scope and type.
   *
   * @param scope - Token scope (User/Game) used to pick the correct token set.
   * @param type - Token type (Access/Refresh) to retrieve.
   * @returns The token string if present; otherwise `undefined`.
   */
  getToken: (scope: TokenScope, type: TokenType) => string | undefined

  /**
   * Persists a new access/refresh token pair for the provided scope.
   *
   * @param scope - Token scope (User/Game) the tokens belong to.
   * @param accessToken - New access token.
   * @param refreshToken - New refresh token.
   */
  setTokenPair: (
    scope: TokenScope,
    accessToken: string,
    refreshToken: string,
  ) => void

  /**
   * Refreshes the current user profile after user-scope authentication changes.
   *
   * This is only invoked for `TokenScope.User` and is not called for game-scope tokens.
   *
   * @param accessToken - A valid user access token.
   */
  fetchCurrentUser: (accessToken: string) => Promise<void>

  /**
   * Optional `fetch` implementation override, primarily intended for tests.
   */
  fetchImpl?: typeof fetch
}

/**
 * Creates a request executor that centralizes auth token usage and retry behavior.
 *
 * Responsibilities:
 * - Resolves scope-specific access/refresh tokens via `deps.getToken`.
 * - Performs a refresh using the refresh token when appropriate and persists the new token pair.
 * - Replays a failed request once after an HTTP 401 by refreshing and retrying with the new access token.
 *
 * Non-responsibilities:
 * - No UI side effects (notifications, navigation).
 * - No React hook usage.
 * - No dependency on resource modules (avoids circular imports).
 *
 * @param deps - Runtime dependencies for token access, token persistence, and user hydration.
 * @returns A small client surface (`apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`) backed by `apiFetch`.
 */
export const createApiClientCore = (deps: ApiClientCoreDeps) => {
  const fetchImpl = deps.fetchImpl ?? fetch

  const refreshViaFetch = async (
    scope: TokenScope,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    // Important: do NOT call apiPost here, to avoid circular dependencies.
    const response = await fetchImpl(resolveUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const res = await parseResponseAndHandleError<{
      accessToken: string
      refreshToken: string
    }>(response)

    deps.setTokenPair(scope, res.accessToken, res.refreshToken)
    if (scope === TokenScope.User) {
      await deps.fetchCurrentUser(res.accessToken)
    }

    return res
  }

  const apiFetch = async <T extends object | void>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: ApiPostBody | undefined,
    options: FetchOptions = {},
  ): Promise<T> => {
    const overrideToken = options.token
    const scope = options.scope ?? TokenScope.User
    const shouldRefresh = options.refresh ?? true

    let accessToken = overrideToken || deps.getToken(scope, TokenType.Access)
    let refreshToken = deps.getToken(scope, TokenType.Refresh)

    // 1) Preemptively refresh expired accessToken (skip if overridden token or refresh is disabled)
    if (
      !overrideToken &&
      isTokenExpired(accessToken) &&
      refreshToken &&
      path !== '/auth/refresh' &&
      shouldRefresh
    ) {
      const refreshed = await refreshViaFetch(scope, refreshToken)
      accessToken = refreshed.accessToken
      refreshToken = refreshed.refreshToken
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    if (accessToken && path !== '/auth/refresh') {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetchImpl(resolveUrl(path), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    // 2) If 401 and we have a refreshToken (and not on the refresh path), try one refresh+retry
    if (
      response.status === 401 &&
      refreshToken &&
      path !== '/auth/refresh' &&
      shouldRefresh
    ) {
      const refreshed = await refreshViaFetch(scope, refreshToken)
      return apiFetch<T>(method, path, body, {
        scope,
        token: refreshed.accessToken,
        refresh: false,
      })
    }

    return parseResponseAndHandleError<T>(response)
  }

  return {
    apiFetch,
    apiGet: <T extends object | void>(
      path: string,
      options: FetchOptions = {},
    ) => apiFetch<T>('GET', path, undefined, options),

    apiPost: <T extends object | void>(
      path: string,
      requestBody: ApiPostBody,
      options: FetchOptions = {},
    ) => apiFetch<T>('POST', path, requestBody, options),

    apiPut: <T extends object | void>(
      path: string,
      requestBody: ApiPostBody,
      options: FetchOptions = {},
    ) => apiFetch<T>('PUT', path, requestBody, options),

    apiPatch: <T extends object | void>(
      path: string,
      requestBody: ApiPostBody,
      options: FetchOptions = {},
    ) => apiFetch<T>('PATCH', path, requestBody, options),

    apiDelete: <T extends object | void>(
      path: string,
      requestBody?: ApiPostBody,
      options: FetchOptions = {},
    ) => apiFetch<T>('DELETE', path, requestBody, options),
  }
}

/**
 * Public type for the client core returned from `createApiClientCore`.
 *
 * Use this for resource constructors to ensure all resources depend on the same minimal surface.
 */
export type ApiClientCore = ReturnType<typeof createApiClientCore>
