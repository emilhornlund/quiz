import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import NonInteractiveInfoBox from './NonInteractiveInfoBox'

describe('NonInteractiveInfoBox', () => {
  it('renders a NonInteractiveInfoBox', () => {
    const { container } = render(
      <NonInteractiveInfoBox info="This is a non-interactive info box" />,
    )

    expect(container).toMatchSnapshot()
  })
})
