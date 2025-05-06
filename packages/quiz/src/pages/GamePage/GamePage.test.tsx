import { render } from '@testing-library/react'
import React from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import GamePage from './GamePage'

describe('GamePage', () => {
  it('should render GamePage', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <GamePage />,
        },
      ],
      {
        initialEntries: ['/'],
      },
    )

    const { container } = render(<RouterProvider router={router} />)

    expect(container).toMatchSnapshot()
  })
})
