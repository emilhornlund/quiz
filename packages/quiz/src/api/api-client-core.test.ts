import { TokenScope, TokenType } from '@quiz/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApiClientCore } from './api-client-core'
// eslint-disable-next-line import/order
import type { ApiPostBody } from './api.utils'

vi.mock('./api.utils', () => ({
  isTokenExpired: vi.fn(),
  parseResponseAndHandleError: vi.fn(),
  resolveUrl: vi.fn((path: string) => `https://example.test${path}`),
}))

import {
  isTokenExpired,
  parseResponseAndHandleError,
  resolveUrl,
} from './api.utils'

type TokenStore = Partial<
  Record<TokenScope, Partial<Record<TokenType, string>>>
>

const makeDeps = (overrides?: {
  tokens?: TokenStore
  fetchImpl?: typeof fetch
  fetchCurrentUser?: (accessToken: string) => Promise<void>
}) => {
  const tokens: TokenStore = overrides?.tokens ?? {}

  const getToken = vi.fn((scope: TokenScope, type: TokenType) => {
    return tokens[scope]?.[type]
  })

  const setTokenPair = vi.fn(
    (scope: TokenScope, accessToken: string, refreshToken: string) => {
      tokens[scope] = tokens[scope] ?? {}
      tokens[scope]![TokenType.Access] = accessToken
      tokens[scope]![TokenType.Refresh] = refreshToken
    },
  )

  const fetchCurrentUser =
    overrides?.fetchCurrentUser ?? vi.fn().mockResolvedValue(undefined)

  const fetchImpl = overrides?.fetchImpl ?? (vi.fn() as unknown as typeof fetch)

  return {
    deps: { getToken, setTokenPair, fetchCurrentUser, fetchImpl },
    tokens,
    getToken,
    setTokenPair,
    fetchCurrentUser,
    fetchImpl,
  }
}

const makeResponse = (status: number): Response =>
  ({ status }) as unknown as Response

describe('createApiClientCore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetch with resolved URL and JSON headers; adds Authorization when access token exists', async () => {
    const { deps, fetchImpl } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: true })

    const api = createApiClientCore(deps)
    const res = await api.apiGet<{ ok: boolean }>('/profile/user')

    expect(resolveUrl).toHaveBeenCalledWith('/profile/user')
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]

    expect(url).toBe('https://example.test/profile/user')
    expect(init.method).toBe('GET')

    const headers = init.headers as Record<string, string>
    expect(headers.Accept).toBe('application/json')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Authorization).toBe('Bearer access.token')

    expect(parseResponseAndHandleError).toHaveBeenCalledWith(response)
    expect(res).toEqual({ ok: true })
  })

  it('does not include Authorization header when path is /auth/refresh', async () => {
    const { deps, fetchImpl } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ accessToken: 'a', refreshToken: 'r' })

    const api = createApiClientCore(deps)
    await api.apiPost<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken: 'refresh.token' } as unknown as ApiPostBody,
    )

    const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]

    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('preemptively refreshes when access token is expired and refresh is enabled; updates token pair and hydrates user for TokenScope.User', async () => {
    const { deps, fetchImpl, setTokenPair, fetchCurrentUser } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'expired.access',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (token: unknown) => token === 'expired.access',
    )

    const refreshResponse = makeResponse(200)
    const dataResponse = makeResponse(200)

    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      refreshResponse,
    )
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      dataResponse,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      accessToken: 'new.access',
      refreshToken: 'new.refresh',
    })
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({ ok: true })

    const api = createApiClientCore(deps)
    const res = await api.apiGet<{ ok: boolean }>('/profile/user')

    expect(fetchImpl).toHaveBeenCalledTimes(2)

    // refresh call
    expect(resolveUrl).toHaveBeenNthCalledWith(1, '/auth/refresh')
    const [refreshUrl, refreshInit] = (
      fetchImpl as unknown as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, RequestInit]
    expect(refreshUrl).toBe('https://example.test/auth/refresh')
    expect(refreshInit.method).toBe('POST')
    expect(refreshInit.body).toBe(
      JSON.stringify({ refreshToken: 'refresh.token' }),
    )

    expect(setTokenPair).toHaveBeenCalledWith(
      TokenScope.User,
      'new.access',
      'new.refresh',
    )
    expect(fetchCurrentUser).toHaveBeenCalledWith('new.access')

    // actual request uses refreshed token
    const [, dataInit] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[1] as [string, RequestInit]
    const dataHeaders = dataInit.headers as Record<string, string>
    expect(dataHeaders.Authorization).toBe('Bearer new.access')

    expect(res).toEqual({ ok: true })
  })

  it('does not preemptively refresh when an override token is provided', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'expired.access',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: true })

    const api = createApiClientCore(deps)
    await api.apiGet<{ ok: boolean }>('/profile/user', {
      token: 'override.access',
    })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(setTokenPair).not.toHaveBeenCalled()

    const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer override.access')
  })

  it('does not preemptively refresh when refresh=false is provided', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'expired.access',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: true })

    const api = createApiClientCore(deps)
    await api.apiGet<{ ok: boolean }>('/profile/user', { refresh: false })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(setTokenPair).not.toHaveBeenCalled()
  })

  it('retries once on 401 by refreshing and reissuing the request with refresh disabled', async () => {
    const { deps, fetchImpl, setTokenPair, fetchCurrentUser } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const firstResponse401 = makeResponse(401)
    const refreshResponse = makeResponse(200)
    const secondResponse200 = makeResponse(200)

    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      firstResponse401,
    )
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      refreshResponse,
    )
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      secondResponse200,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      accessToken: 'new.access',
      refreshToken: 'new.refresh',
    })
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({ ok: true })

    const api = createApiClientCore(deps)
    const res = await api.apiGet<{ ok: boolean }>('/profile/user')

    expect(fetchImpl).toHaveBeenCalledTimes(3)

    // first attempt
    const [, init1] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]
    expect((init1.headers as Record<string, string>).Authorization).toBe(
      'Bearer access.token',
    )

    // refresh
    expect(resolveUrl).toHaveBeenNthCalledWith(2, '/auth/refresh')
    expect(setTokenPair).toHaveBeenCalledWith(
      TokenScope.User,
      'new.access',
      'new.refresh',
    )
    expect(fetchCurrentUser).toHaveBeenCalledWith('new.access')

    // retry uses refreshed token
    const [, init3] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[2] as [string, RequestInit]
    expect((init3.headers as Record<string, string>).Authorization).toBe(
      'Bearer new.access',
    )

    expect(res).toEqual({ ok: true })
  })

  it('does not retry on 401 when refresh token is missing', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response401 = makeResponse(401)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response401,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: false })

    const api = createApiClientCore(deps)
    const res = await api.apiGet<{ ok: boolean }>('/profile/user')

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(setTokenPair).not.toHaveBeenCalled()
    expect(res).toEqual({ ok: false })
  })

  it('does not retry on 401 when calling /auth/refresh', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response401 = makeResponse(401)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response401,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: false })

    const api = createApiClientCore(deps)
    const res = await api.apiPost<{ ok: boolean }>('/auth/refresh', {
      refreshToken: 'refresh.token',
    } as unknown as ApiPostBody)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(setTokenPair).not.toHaveBeenCalled()
    expect(res).toEqual({ ok: false })
  })

  it('hydrates user only for TokenScope.User; game scope refresh does not call fetchCurrentUser', async () => {
    const { deps, fetchImpl, fetchCurrentUser } = makeDeps({
      tokens: {
        [TokenScope.Game]: {
          [TokenType.Access]: 'expired.game.access',
          [TokenType.Refresh]: 'game.refresh',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (token: unknown) => token === 'expired.game.access',
    )

    const refreshResponse = makeResponse(200)
    const dataResponse = makeResponse(200)

    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      refreshResponse,
    )
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      dataResponse,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      accessToken: 'new.game.access',
      refreshToken: 'new.game.refresh',
    })
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({ ok: true })

    const api = createApiClientCore(deps)
    await api.apiGet<{ ok: boolean }>('/games/abc/players', {
      scope: TokenScope.Game,
    })

    expect(fetchCurrentUser).not.toHaveBeenCalled()
  })

  it('apiPost/apiPut/apiPatch/apiDelete pass method and body correctly', async () => {
    const { deps, fetchImpl } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: true })

    const api = createApiClientCore(deps)

    await api.apiPost('/x', { a: 1 } as unknown as ApiPostBody)
    await api.apiPut('/y', { b: 2 } as unknown as ApiPostBody)
    await api.apiPatch('/z', { c: 3 } as unknown as ApiPostBody)
    await api.apiDelete('/w', { d: 4 } as unknown as ApiPostBody)

    const calls = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls
    expect(calls).toHaveLength(4)

    expect((calls[0][1] as RequestInit).method).toBe('POST')
    expect((calls[1][1] as RequestInit).method).toBe('PUT')
    expect((calls[2][1] as RequestInit).method).toBe('PATCH')
    expect((calls[3][1] as RequestInit).method).toBe('DELETE')

    expect((calls[0][1] as RequestInit).body).toBe(JSON.stringify({ a: 1 }))
    expect((calls[1][1] as RequestInit).body).toBe(JSON.stringify({ b: 2 }))
    expect((calls[2][1] as RequestInit).body).toBe(JSON.stringify({ c: 3 }))
    expect((calls[3][1] as RequestInit).body).toBe(JSON.stringify({ d: 4 }))
  })

  it('does not include Authorization header when no access token is available', async () => {
    const { deps, fetchImpl } = makeDeps()

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: true })

    const api = createApiClientCore(deps)
    await api.apiGet<{ ok: boolean }>('/public')

    const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('does not set RequestInit.body when body is undefined', async () => {
    const { deps, fetchImpl } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: true })

    const api = createApiClientCore(deps)
    await api.apiGet<{ ok: boolean }>('/no-body')

    const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]
    expect(Object.prototype.hasOwnProperty.call(init, 'body')).toBe(false)
  })

  it('does not attempt refresh+retry on 401 when refresh is disabled', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const response401 = makeResponse(401)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response401,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ ok: false })

    const api = createApiClientCore(deps)
    const res = await api.apiGet<{ ok: boolean }>('/profile/user', {
      refresh: false,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(setTokenPair).not.toHaveBeenCalled()
    expect(res).toEqual({ ok: false })
  })

  it('does not refresh twice when retrying after 401 (retry uses refresh:false)', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'access.token',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    )

    const first401 = makeResponse(401)
    const refresh200 = makeResponse(200)
    const second401 = makeResponse(401)

    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      first401,
    )
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      refresh200,
    )
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      second401,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      accessToken: 'new.access',
      refreshToken: 'new.refresh',
    })
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({ ok: false })

    const api = createApiClientCore(deps)
    const res = await api.apiGet<{ ok: boolean }>('/profile/user')

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(setTokenPair).toHaveBeenCalledTimes(1)
    expect(resolveUrl).toHaveBeenCalledWith('/auth/refresh')
    expect(res).toEqual({ ok: false })
  })

  it('does not preemptively refresh when calling /auth/refresh even if token is expired', async () => {
    const { deps, fetchImpl, setTokenPair } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'expired.access',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    )

    const response = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response,
    )
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
    })

    const api = createApiClientCore(deps)
    await api.apiPost('/auth/refresh', {
      refreshToken: 'refresh.token',
    } as unknown as ApiPostBody)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(setTokenPair).not.toHaveBeenCalled()
  })

  it('propagates refresh parsing failure and does not persist tokens', async () => {
    const { deps, fetchImpl, setTokenPair, fetchCurrentUser } = makeDeps({
      tokens: {
        [TokenScope.User]: {
          [TokenType.Access]: 'expired.access',
          [TokenType.Refresh]: 'refresh.token',
        },
      },
    })

    ;(isTokenExpired as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    )

    const refreshResponse = makeResponse(200)
    ;(fetchImpl as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      refreshResponse,
    )

    const err = new Error('bad refresh payload')
    ;(
      parseResponseAndHandleError as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(err)

    const api = createApiClientCore(deps)

    await expect(api.apiGet('/profile/user')).rejects.toBe(err)
    expect(setTokenPair).not.toHaveBeenCalled()
    expect(fetchCurrentUser).not.toHaveBeenCalled()
  })
})
