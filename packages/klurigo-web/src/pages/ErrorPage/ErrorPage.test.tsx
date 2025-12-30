import { render, screen } from '@testing-library/react'
import { MemoryRouter, useNavigate, useRouteError } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ErrorPage from './ErrorPage'

// Mock `useRouteError` and `useNavigate` to simulate error responses and navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useRouteError: vi.fn(),
    useNavigate: vi.fn(), // Define useNavigate as a mock function
  }
})

describe('ErrorPage', () => {
  it('should render the default error message', () => {
    ;(useRouteError as jest.Mock).mockReturnValueOnce(null)

    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument()
    expect(
      screen.getByText('An unexpected error occurred.'),
    ).toBeInTheDocument()
  })

  it('should display custom error message based on route error', () => {
    ;(useRouteError as jest.Mock).mockReturnValueOnce({
      statusText: 'Not Found',
      data: 'The requested page could not be found.',
    })

    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(
      screen.getByText('The requested page could not be found.'),
    ).toBeInTheDocument()
  })

  it('should navigate back when the back button is clicked', () => {
    const navigateMock = vi.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigateMock)

    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    )

    const backButton = screen.getByRole('button', { name: /go back/i })
    backButton.click()

    expect(navigateMock).toHaveBeenCalledWith(-1)
  })

  it('should match snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
