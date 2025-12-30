import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'

import Page from './Page'

test('should render Page with default props', async () => {
  const { container } = render(
    <MemoryRouter>
      <Page>Content</Page>
    </MemoryRouter>,
  )

  expect(container).toMatchSnapshot()
})

test('should render Page with header', async () => {
  const { container } = render(
    <MemoryRouter>
      <Page
        header={
          <>
            <a href="#">Link1</a>
            <a href="#">Link2</a>
          </>
        }>
        Content
      </Page>
    </MemoryRouter>,
  )

  expect(container).toMatchSnapshot()
})

test('should render Page with profile', async () => {
  const { container } = render(
    <MemoryRouter>
      <Page profile>Content</Page>
    </MemoryRouter>,
  )

  expect(container).toMatchSnapshot()
})
