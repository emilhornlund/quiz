import { render } from '@testing-library/react'
import React from 'react'
import { expect, test } from 'vitest'

import Page from './Page'

test('should render Page with default props', async () => {
  const { container } = render(<Page>Content</Page>)

  expect(container).toMatchSnapshot()
})

test('should render Page with header', async () => {
  const { container } = render(
    <Page
      header={
        <>
          <a href="#">Link1</a>
          <a href="#">Link2</a>
        </>
      }>
      Content
    </Page>,
  )

  expect(container).toMatchSnapshot()
})
