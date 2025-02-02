import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import QuizTableFilter from './QuizTableFilter'

describe('QuizTableFilter', () => {
  it('should render QuizTableFilter', async () => {
    const { container } = render(
      <QuizTableFilter onChange={() => undefined} showVisibilityFilter />,
    )

    expect(container).toMatchSnapshot()
  })
})
