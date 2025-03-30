import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import Dropzone from './Dropzone'

describe('Dropzone', () => {
  it('should render a Dropzone with default props', async () => {
    const { container } = render(
      <Dropzone progress={undefined} onUpload={undefined} />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a Dropzone with progress bar', async () => {
    const { container } = render(
      <Dropzone progress={50} onUpload={undefined} />,
    )

    expect(container).toMatchSnapshot()
  })
})
