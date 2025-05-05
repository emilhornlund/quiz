import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it } from 'vitest'

import { Player } from '../../../../models'

import ProfilePageUI from './ProfilePageUI'

const player: Player = {
  id: uuidv4(),
  nickname: 'FrostyBear',
}

describe('ProfilePageUI', () => {
  it('should render ProfilePageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfilePageUI player={player} onNicknameChange={() => undefined} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
