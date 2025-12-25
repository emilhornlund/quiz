import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PlayerGameFooter from './PlayerGameFooter'

describe('PlayerGameFooter', () => {
  it('should render PlayerGameFooter with default props', () => {
    const { container } = render(
      <PlayerGameFooter
        currentQuestion={1}
        totalQuestions={20}
        nickname="FrostyBear"
        totalScore={10361}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
