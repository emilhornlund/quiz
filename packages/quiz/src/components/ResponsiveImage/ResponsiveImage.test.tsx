import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ResponsiveImage from './ResponsiveImage'

describe('ResponsiveImage', () => {
  it('should render ResponsiveImage with props', async () => {
    const { container } = render(
      <ResponsiveImage
        imageURL="https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg"
        alt="Who painted The Starry Night?"
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
