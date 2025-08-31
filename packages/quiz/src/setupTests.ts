import { ResizeObserver } from '@juggle/resize-observer'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import '@testing-library/jest-dom'

// Only polyfill if missing
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserver
}

export const restHandlers = [
  http.get('/quiz-service/api/hello', () => {
    return HttpResponse.json({
      value: 'Hello, World!',
    })
  }),
]

const server = setupServer(...restHandlers)

expect.extend(matchers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterAll(() => server.close())

afterEach(() => {
  server.resetHandlers()
  cleanup()
})
