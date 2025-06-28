import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ProfilePageUI from './ProfilePageUI'

describe('ProfilePageUI', () => {
  it('should render ProfilePageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfilePageUI onNicknameChange={() => undefined} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
