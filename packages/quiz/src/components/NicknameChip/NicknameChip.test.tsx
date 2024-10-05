import { render } from '@testing-library/react'
import React from 'react'
import { expect, test } from 'vitest'

import NicknameChip from './NicknameChip'

test('should render NicknameChip with default props', async () => {
  const { container } = render(<NicknameChip value="FrostyBear" />)

  expect(container).toMatchSnapshot()
})
