import { TokenScope } from '@quiz/common'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useQuizServiceClient } from './use-quiz-service-client'

const setFetchMock = (fn: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as unknown as { fetch: any }).fetch = fn
}

const okResponse = () =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => undefined,
    text: async () => '',
  })

describe('useQuizServiceClient', () => {
  describe('revoke', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('resolves when the API call succeeds', async () => {
      const fetchMock = vi.fn().mockImplementation(() => okResponse())
      setFetchMock(fetchMock)

      const { result, unmount } = renderHook(() => useQuizServiceClient())
      const request = { token: 'ok-token' }

      await act(async () => {
        await expect(
          result.current.revoke(request, TokenScope.User),
        ).resolves.toBeUndefined()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(String(fetchMock.mock.calls[0][0])).toContain('/auth/revoke')
      unmount()
    })

    it('resolves even when the API call rejects (error swallowed)', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('boom'))
      setFetchMock(fetchMock)

      const { result, unmount } = renderHook(() => useQuizServiceClient())
      const request = { token: 'bad-token' }

      await act(async () => {
        await expect(
          result.current.revoke(request, TokenScope.User),
        ).resolves.toBeUndefined()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(String(fetchMock.mock.calls[0][0])).toContain('/auth/revoke')
      unmount()
    })
  })
})
