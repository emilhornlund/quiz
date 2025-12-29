import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import StreakBadge from './StreakBadge'

describe('StreakBadge', () => {
  it('should render a StreakBadge', () => {
    const { container } = render(<StreakBadge streak={3} />)

    expect(container).toMatchSnapshot()
  })

  it('should render a StreakBadge with label', () => {
    const { container } = render(<StreakBadge streak={3}>Label</StreakBadge>)

    expect(container).toMatchSnapshot()
  })

  it('should not render a StreakBadge', () => {
    const { container } = render(<StreakBadge />)

    expect(container).toMatchSnapshot()
  })
})
