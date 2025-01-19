import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render a LoadingSpinner with default props', async () => {
    const { container } = render(<LoadingSpinner />)

    expect(container).toMatchSnapshot()
  })
})
