import { QuestionPinTolerance } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PinImage from './PinImage'

describe('PinImage', () => {
  it('should render PinImage with default props', async () => {
    const { container } = render(<PinImage />)

    expect(container).toMatchSnapshot()
  })

  it('should render PinImage with all props', async () => {
    const { container } = render(
      <PinImage
        imageURL="https://example.com/image.png"
        positionX={0.1}
        positionY={0.9}
        tolerance={QuestionPinTolerance.Medium}
        onChange={() => undefined}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
