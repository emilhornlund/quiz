import { QuestionPinTolerance } from '@quiz/common'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PinImage from './PinImage'
import { PinColor } from './types.ts'

describe('PinImage', () => {
  it('should render PinImage with default props', async () => {
    const { container } = render(<PinImage />)

    expect(container).toMatchSnapshot()
  })

  it('should render PinImage with all props', async () => {
    const { container } = render(
      <PinImage
        imageURL="https://example.com/image.png"
        value={{ x: 0.1, y: 0.9, tolerance: QuestionPinTolerance.Medium }}
        values={[
          { x: 0.5, y: 0.45, color: PinColor.Green },
          { x: 0.3, y: 0.25, color: PinColor.Red },
          { x: 0.85, y: 0.75, color: PinColor.Red },
        ]}
        onChange={() => undefined}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render PinImage with multiple pins', async () => {
    const { container } = render(
      <PinImage
        imageURL="https://example.com/image.png"
        values={[
          { x: 0.5, y: 0.45, color: PinColor.Green },
          { x: 0.3, y: 0.25, color: PinColor.Red },
          { x: 0.85, y: 0.75, color: PinColor.Red },
        ]}
        onChange={() => undefined}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
