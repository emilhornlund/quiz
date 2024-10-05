import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import HostGameFooter from './HostGameFooter'

describe('HostGameFooter', () => {
  it('should render HostGameFooter with default props', () => {
    const { container } = render(
      <HostGameFooter
        gamePIN="123456"
        currentQuestion={1}
        totalQuestions={20}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
