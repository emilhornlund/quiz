import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// IMPORTANT: mock the same specifiers the component imports
vi.mock('../../utils/constants.ts', () => ({
  REDIRECT_TARGET_HOST: 'example.com',
}))

// Default mocks for usehooks-ts; individual tests can override
let startCountdownSpy = vi.fn()
let mockedCount = 10

vi.mock('usehooks-ts', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('usehooks-ts')
  return {
    ...actual,
    useLocalStorage: vi.fn((key: string, initial?: unknown) => {
      const raw = window.localStorage.getItem(key)
      return [raw ?? (initial as unknown), vi.fn()] as const
    }),
    useCountdown: vi.fn(() => {
      return [mockedCount, { startCountdown: startCountdownSpy }] as const
    }),
  }
})

import LegacyRedirectionPage from './LegacyRedirectionPage'

// helper to render with router
const renderWithRouter = (ui: React.ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('LegacyRedirectionPage', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    startCountdownSpy = vi.fn()
    mockedCount = 10
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders title and shows target host in subtitle', () => {
    const { container } = renderWithRouter(<LegacyRedirectionPage />)

    expect(screen.getByText(/We’ve moved—come with us!/i)).toBeInTheDocument()

    expect(screen.getByText(/Your new home is/i).textContent).toContain(
      'example.com',
    )

    expect(container).toMatchSnapshot()
  })

  it('shows the “saved profile” message when a migration token exists and builds the link with the token', () => {
    const token = 'abc123'
    window.localStorage.setItem('migrationToken', token)

    const { container } = renderWithRouter(<LegacyRedirectionPage />)

    expect(
      screen.getByText(/We’ve saved your old profile/i),
    ).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Take me there now/i })
    expect(link).toHaveAttribute(
      'href',
      `https://example.com?migrationToken=${token}`,
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')

    expect(container).toMatchSnapshot()
  })

  it('shows the “fresh start” message when no migration token exists and builds the link without query', () => {
    const { container } = renderWithRouter(<LegacyRedirectionPage />)

    expect(
      screen.getByText(/Fresh start—no past activity found on this device./i),
    ).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Take me there now/i })
    expect(link).toHaveAttribute('href', 'https://example.com')

    expect(container).toMatchSnapshot()
  })

  it('starts the countdown on mount', () => {
    const { container } = renderWithRouter(<LegacyRedirectionPage />)
    expect(startCountdownSpy).toHaveBeenCalledTimes(1)

    expect(container).toMatchSnapshot()
  })

  it('announces the remaining seconds in the aria-live region', () => {
    mockedCount = 7
    const { container } = renderWithRouter(<LegacyRedirectionPage />)

    const live = screen.getByText(/Warping you over in/i)
    expect(live.textContent).toContain('7s')

    expect(container).toMatchSnapshot()
  })

  it('redirects with window.location.replace and logs when the count hits 0', () => {
    const token = 'xyz'
    window.localStorage.setItem('migrationToken', token)

    // Force the hook to return 0 immediately so the effect triggers on first render
    mockedCount = 0

    // Mock window.location.replace safely in JSDOM
    const originalLocation = window.location
    const replaceMock = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        replace: replaceMock,
      },
    })

    const { container } = renderWithRouter(<LegacyRedirectionPage />)

    const expectedUrl = `https://example.com?migrationToken=${token}`
    expect(console.log).toHaveBeenCalledWith(`Redirecting to '${expectedUrl}'.`)
    expect(replaceMock).toHaveBeenCalledWith(expectedUrl)

    // Restore original location to avoid side-effects on other tests
    Object.defineProperty(window, 'location', { value: originalLocation })

    expect(container).toMatchSnapshot()
  })
})
