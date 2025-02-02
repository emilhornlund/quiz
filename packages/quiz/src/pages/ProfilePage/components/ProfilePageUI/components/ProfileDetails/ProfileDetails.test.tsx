import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ProfileDetails from './ProfileDetails'

describe('ProfileDetails', () => {
  it('should render ProfileDetails', async () => {
    const { container } = render(
      <ProfileDetails nickname="FrostyBear" onChange={() => undefined} />,
    )

    expect(container).toMatchSnapshot()
  })
})
