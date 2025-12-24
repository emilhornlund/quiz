import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import NicknameChip from './NicknameChip'

test('should render NicknameChip with default props', async () => {
  const { container } = render(<NicknameChip value="FrostyBear" />)

  expect(container).toMatchSnapshot()
})

test('should render NicknameChip with entrance animation', async () => {
  const { container } = render(
    <NicknameChip
      value="FrostyBear"
      animationState="entrance"
      staggerDelay={100}
    />,
  )

  expect(container).toMatchSnapshot()
})

test('should render NicknameChip with exit animation', async () => {
  const { container } = render(
    <NicknameChip value="FrostyBear" animationState="exit" />,
  )

  expect(container).toMatchSnapshot()
})

test('should render NicknameChip with shake animation', async () => {
  const { container } = render(
    <NicknameChip value="FrostyBear" animationState="shake" />,
  )

  expect(container).toMatchSnapshot()
})

test('should render NicknameChip with delete button', async () => {
  const { container } = render(
    <NicknameChip value="FrostyBear" onDelete={() => {}} />,
  )

  expect(container).toMatchSnapshot()
})
