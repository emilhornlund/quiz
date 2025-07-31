import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, test } from 'vitest'

import NicknameTextField from './NicknameTextField'

describe('NicknameTextField', () => {
  test('should render NicknameTextField with default props', async () => {
    const { container } = render(<NicknameTextField value="FrostyBear" />)

    expect(container).toMatchSnapshot()
  })
})
