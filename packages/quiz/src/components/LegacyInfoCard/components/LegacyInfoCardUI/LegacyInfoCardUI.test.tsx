import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import LegacyInfoCardUI from './LegacyInfoCardUI'

describe('LegacyInfoCardUI', () => {
  it('should render a LegacyInfoCardUI as not migrated', async () => {
    const { container } = render(
      <LegacyInfoCardUI
        migrated={false}
        legacyDomain="https://legacy.com"
        targetDomain="https://target.com"
        onDismiss={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render a LegacyInfoCardUI as migrated', async () => {
    const { container } = render(
      <LegacyInfoCardUI
        migrated={true}
        legacyDomain="https://legacy.com"
        targetDomain="https://target.com"
        onDismiss={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
