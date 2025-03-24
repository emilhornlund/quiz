import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import MediaModal from './MediaModal'

describe('MediaModal', () => {
  it('should render a MediaModal with default props', async () => {
    const { container } = render(
      <MediaModal
        onChange={() => undefined}
        onValid={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
