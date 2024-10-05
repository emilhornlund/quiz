import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PlayerGameFooter from './PlayerGameFooter'

describe('PlayerGameFooter', () => {
  it('should render PlayerGameFooter with default props', () => {
    const { container } = render(
      <PlayerGameFooter nickname="FrostyBear" totalScore={10361} />,
    )

    expect(container).toMatchSnapshot()
  })
})
