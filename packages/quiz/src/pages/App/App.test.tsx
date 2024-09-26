import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { expect, test } from 'vitest'

import App from './App.tsx'

test('should render application', async () => {
  const { container } = render(<App />)

  expect(container).toMatchSnapshot()
})

test('should fetch hello world message', async () => {
  const { container } = render(<App />)

  screen.getByText('Fetch')

  const button = screen.getByTestId('fetch-button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getByText('Hello, World!')).toBeInTheDocument()
  })

  expect(container).toMatchSnapshot()
})
