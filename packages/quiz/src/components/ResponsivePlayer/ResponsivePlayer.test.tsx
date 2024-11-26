import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ResponsivePlayer from './ResponsivePlayer'

describe('ResponsiveImage', () => {
  it('should render ResponsiveImage with props', async () => {
    const { container } = render(
      <ResponsivePlayer url="https://www.youtube.com/watch?v=LXb3EKWsInQ" />,
    )
    expect(container).toMatchSnapshot()
  })
})
