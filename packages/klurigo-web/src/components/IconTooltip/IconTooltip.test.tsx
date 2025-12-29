import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import IconTooltip from './IconTooltip'

describe('IconTooltip', () => {
  it('should render IconTooltip with default props', () => {
    const { container } = render(
      <IconTooltip icon={faCircleInfo}>Tooltip text</IconTooltip>,
    )

    expect(container).toMatchSnapshot()
  })
})
