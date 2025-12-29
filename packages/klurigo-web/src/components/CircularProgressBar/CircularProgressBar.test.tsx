import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CircularProgressBar from './CircularProgressBar'
import { CircularProgressBarKind, CircularProgressBarSize } from './types.ts'

describe('CircularProgressBar', () => {
  it('should render a CircularProgressBar with default props', async () => {
    const { container } = render(<CircularProgressBar progress={65} />)

    expect(container).toMatchSnapshot()
  })

  it('should render a CircularProgressBar with size small props', async () => {
    const { container } = render(
      <CircularProgressBar
        progress={65}
        size={CircularProgressBarSize.Small}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a CircularProgressBar with size medium props', async () => {
    const { container } = render(
      <CircularProgressBar
        progress={65}
        size={CircularProgressBarSize.Medium}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a CircularProgressBar with size large props', async () => {
    const { container } = render(
      <CircularProgressBar
        progress={65}
        size={CircularProgressBarSize.Large}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a CircularProgressBar with kind default props', async () => {
    const { container } = render(
      <CircularProgressBar
        progress={65}
        kind={CircularProgressBarKind.Default}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a CircularProgressBar with kind correct props', async () => {
    const { container } = render(
      <CircularProgressBar
        progress={65}
        kind={CircularProgressBarKind.Correct}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a CircularProgressBar without progress text', async () => {
    const { container } = render(
      <CircularProgressBar progress={65} showPercentage={false} />,
    )

    expect(container).toMatchSnapshot()
  })
})
