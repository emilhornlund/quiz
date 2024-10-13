import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import CreateGamePage from './CreateGamePage'

describe('CreateGamePage', () => {
  it('should render CreateGamePage', async () => {
    const { container } = render(
      <MemoryRouter>
        <CreateGamePage />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
