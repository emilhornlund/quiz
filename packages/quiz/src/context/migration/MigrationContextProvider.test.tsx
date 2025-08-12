import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React, { useContext } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---- Mocks ----

const MOCK_MIGRATION_TOKEN = 'jU4n2n9eC-8GEZhk8NcApcfNQF9xO0yQOeJUZQk4w-E'

// Auth context
const mockIsUserAuthenticated = { current: false }
vi.mock('../auth', () => ({
  useAuthContext: () => ({
    isUserAuthenticated: mockIsUserAuthenticated.current,
  }),
}))

// API client
const migrateUserSpy = vi.fn(() => Promise.resolve())
vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ migrateUser: migrateUserSpy }),
}))

// Notifications
const notifySuccessSpy = vi.fn()
vi.mock('../../utils/notification.ts', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notifySuccess: (...args: any[]) => notifySuccessSpy(...args),
}))

// sha256
type Sha256Fn = (input: string) => Promise<string>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sha256Spy = vi.fn<Sha256Fn>(async (_input) => MOCK_MIGRATION_TOKEN)
vi.mock('../../utils/oauth.ts', () => ({
  sha256: (...args: Parameters<Sha256Fn>) => sha256Spy(...args),
}))

// react-router useSearchParams
let searchParamsInstance: URLSearchParams
const setSearchParamsSpy = vi.fn()
vi.mock('react-router-dom', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => [searchParamsInstance, setSearchParamsSpy] as const,
  }
})

import { MigrationContext } from './migration-context.tsx'
import MigrationContextProvider from './MigrationContextProvider'

// useLocalStorage from usehooks-ts
// Provide per-key spies/values to assert side effects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clearClientSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clearPlayerSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clearTokenSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let setMigrationTokenSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clearMigrationTokenSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let setMigratedSpy: any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let localValues: Record<string, any>

vi.mock('usehooks-ts', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('usehooks-ts')
  return {
    ...actual,
    useLocalStorage: vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (key: string, initial?: unknown, _opts?: unknown) => {
        switch (key) {
          case 'client':
            return [localValues.client, vi.fn(), clearClientSpy] as const
          case 'player':
            return [localValues.player, vi.fn(), clearPlayerSpy] as const
          case 'token':
            return [localValues.token, vi.fn(), clearTokenSpy] as const
          case 'migrationToken':
            return [
              localValues.migrationToken,
              setMigrationTokenSpy,
              clearMigrationTokenSpy,
            ] as const
          case 'migrated':
            return [localValues.migrated, setMigratedSpy] as const
          default:
            throw new Error(`Unexpected localStorage key: ${key}`)
        }
      },
    ),
  }
})

// ---- Test helper/components ----

const renderWithProviders = (ui: React.ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

const ConsumerButton = () => {
  const ctx = useContext(MigrationContext)
  return (
    <button onClick={() => ctx.completeMigration()} data-testid="complete">
      Complete
    </button>
  )
}

// ---- Lifecycle ----

beforeEach(() => {
  cleanup()
  vi.restoreAllMocks()

  // reset spies
  migrateUserSpy.mockClear()
  notifySuccessSpy.mockClear()
  sha256Spy.mockClear()
  setSearchParamsSpy.mockClear()

  clearClientSpy = vi.fn()
  clearPlayerSpy = vi.fn()
  clearTokenSpy = vi.fn()
  setMigrationTokenSpy = vi.fn()
  clearMigrationTokenSpy = vi.fn()
  setMigratedSpy = vi.fn()

  // default local storage values
  localValues = {
    client: undefined,
    player: undefined,
    token: undefined,
    migrationToken: undefined,
    migrated: false,
  }

  // default URL has no migrationToken
  searchParamsInstance = new URLSearchParams('')
  // default unauthenticated
  mockIsUserAuthenticated.current = false
})

afterEach(() => {
  cleanup()
})

// ---- Tests ----

describe('MigrationContextProvider', () => {
  it('authenticated + migrationToken in URL -> migrates once and removes query param', async () => {
    mockIsUserAuthenticated.current = true
    searchParamsInstance = new URLSearchParams(
      `migrationToken=${MOCK_MIGRATION_TOKEN}`,
    )

    const { rerender } = renderWithProviders(
      <MigrationContextProvider>
        <div>child</div>
      </MigrationContextProvider>,
    )

    // First render: should migrate and clear param
    expect(migrateUserSpy).toHaveBeenCalledTimes(1)
    expect(migrateUserSpy).toHaveBeenCalledWith({
      migrationToken: MOCK_MIGRATION_TOKEN,
    })

    // setSearchParams called with the same mutated URLSearchParams (token removed)
    expect(setSearchParamsSpy).toHaveBeenCalledTimes(1)
    const passedParams = setSearchParamsSpy.mock.calls[0][0] as URLSearchParams
    expect(passedParams.get('migrationToken')).toBeNull()

    // Re-render: should NOT migrate again due to hasMigrated ref
    rerender(
      <MemoryRouter>
        <MigrationContextProvider>
          <div>child</div>
        </MigrationContextProvider>
      </MemoryRouter>,
    )
    expect(migrateUserSpy).toHaveBeenCalledTimes(1)
  })

  it('unauthenticated + migrationToken in URL -> stores token, notifies success, removes query param', () => {
    mockIsUserAuthenticated.current = false
    searchParamsInstance = new URLSearchParams(
      `migrationToken=${MOCK_MIGRATION_TOKEN}`,
    )

    renderWithProviders(
      <MigrationContextProvider>
        <div>child</div>
      </MigrationContextProvider>,
    )

    expect(setMigrationTokenSpy).toHaveBeenCalledWith(MOCK_MIGRATION_TOKEN)
    expect(notifySuccessSpy).toHaveBeenCalledTimes(1)
    expect(setSearchParamsSpy).toHaveBeenCalledTimes(1)
    const passedParams = setSearchParamsSpy.mock.calls[0][0] as URLSearchParams
    expect(passedParams.get('migrationToken')).toBeNull()
    expect(migrateUserSpy).not.toHaveBeenCalled()
  })

  it('no URL token + client & player present -> computes sha256 and sets migration token if different', async () => {
    localValues.client = { id: 'c1' }
    localValues.player = { id: 'p1' }
    localValues.migrationToken = undefined
    sha256Spy.mockResolvedValueOnce('hash123')

    renderWithProviders(
      <MigrationContextProvider>
        <div>child</div>
      </MigrationContextProvider>,
    )

    // async sha256 promise resolved → setter should be called with computed hash
    // (no timers here; effect schedules a Promise, which resolves in microtask)
    await Promise.resolve()
    expect(sha256Spy).toHaveBeenCalledWith('c1:p1')
    expect(setMigrationTokenSpy).toHaveBeenCalledWith('hash123')
  })

  it('does not overwrite migration token if already equal to computed sha256', async () => {
    localValues.client = { id: 'c1' }
    localValues.player = { id: 'p1' }
    localValues.migrationToken = 'hash123' // already equal to computed
    sha256Spy.mockResolvedValueOnce('hash123')

    renderWithProviders(
      <MigrationContextProvider>
        <div>child</div>
      </MigrationContextProvider>,
    )

    await Promise.resolve()
    expect(sha256Spy).toHaveBeenCalledWith('c1:p1')
    expect(setMigrationTokenSpy).not.toHaveBeenCalled()
  })

  it('completeMigration clears storages and sets migrated true', () => {
    renderWithProviders(
      <MigrationContextProvider>
        <ConsumerButton />
      </MigrationContextProvider>,
    )

    fireEvent.click(screen.getByTestId('complete'))

    expect(clearClientSpy).toHaveBeenCalledTimes(1)
    expect(clearPlayerSpy).toHaveBeenCalledTimes(1)
    expect(clearTokenSpy).toHaveBeenCalledTimes(1)
    expect(clearMigrationTokenSpy).toHaveBeenCalledTimes(1)
    expect(setMigratedSpy).toHaveBeenCalledWith(true)
  })
})
