import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import HomePage from './HomePage'

describe('HomePage', () => {
  it('should render HomePage', async () => {
    render(<HomePage />)
  })
})
