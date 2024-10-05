import { render } from '@testing-library/react'
import React from 'react'
import { expect, test } from 'vitest'

import RocketImage from './RocketImage'

test('should render RocketImage with default props', async () => {
  const { container } = render(<RocketImage />)

  expect(container).toMatchSnapshot()
})
