import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  sendPasswordResetEmail: vi
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .fn<[{ email: string }], Promise<void>>()
    .mockResolvedValue({}),
  navigate: vi.fn(),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({
    sendPasswordResetEmail: h.sendPasswordResetEmail,
  }),
}))

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})

import AuthPasswordForgotPage from './AuthPasswordForgotPage'

describe('AuthPasswordForgotPage', () => {
  beforeEach(() => {
    h.sendPasswordResetEmail.mockClear()
    h.navigate.mockClear()
  })

  it('renders and has disabled submit initially', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPage />
      </MemoryRouter>,
    )

    const submit = container.querySelector(
      '#continue-button',
    ) as HTMLButtonElement
    expect(submit).toBeDisabled()
    expect(container).toMatchSnapshot()
  })

  it('submits valid email, disables during request, then navigates home on success', async () => {
    let resolve!: () => void
    h.sendPasswordResetEmail.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    )

    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })

    const submit = container.querySelector(
      '#continue-button',
    ) as HTMLButtonElement
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)
    expect(h.sendPasswordResetEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
    })
    expect(submit).toBeDisabled()

    resolve()
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'))
    expect(submit).not.toBeDisabled()
  })

  it('re-enables submit and does not navigate on failure', async () => {
    // async finally so loading=true is rendered before we flip it back to false
    const thenable = {
      then: () => thenable,
      catch: () => thenable,
      finally: (cb: () => void) => {
        setTimeout(cb, 0)
        return thenable
      },
    } as unknown as Promise<void>

    h.sendPasswordResetEmail.mockReturnValue(thenable)

    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })

    const submit = container.querySelector(
      '#continue-button',
    ) as HTMLButtonElement
    fireEvent.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
    await waitFor(() => expect(submit).not.toBeDisabled())
    expect(h.navigate).not.toHaveBeenCalled()
  })
})
