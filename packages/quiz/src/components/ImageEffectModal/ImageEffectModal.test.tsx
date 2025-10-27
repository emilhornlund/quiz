import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ImageEffectModal from './ImageEffectModal'

const defaultProps = {
  title: 'Test Image Effect',
  onClose: () => {},
  onValid: () => {},
  onChangeImageEffect: () => {},
}

describe('ImageEffectModal', () => {
  it('renders correctly (snapshot)', () => {
    const { container } = render(<ImageEffectModal {...defaultProps} />)
    expect(container).toMatchSnapshot()
  })
})
