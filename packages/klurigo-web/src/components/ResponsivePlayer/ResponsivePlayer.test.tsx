import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-player', () => ({
  default: ({ url }: { url: string }) => (
    <div data-testid="react-player" data-url={url} />
  ),
}))

import ResponsivePlayer from './ResponsivePlayer'

describe('ResponsivePlayer', () => {
  it('should render ResponsivePlayer with props', () => {
    const { container } = render(
      <ResponsivePlayer url="https://www.youtube.com/watch?v=LXb3EKWsInQ" />,
    )
    expect(container).toMatchSnapshot()
  })
})
