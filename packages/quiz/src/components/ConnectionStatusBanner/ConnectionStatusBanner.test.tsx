import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { ConnectionStatus } from '../../utils/use-event-source.tsx'

import ConnectionStatusBanner from './ConnectionStatusBanner'

describe('ConnectionStatusBanner', () => {
  it('should render ConnectionStatusBanner with connected status', () => {
    const { container } = render(
      <ConnectionStatusBanner status={ConnectionStatus.CONNECTED} />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render ConnectionStatusBanner with reconnecting status', () => {
    const { container } = render(
      <ConnectionStatusBanner status={ConnectionStatus.RECONNECTING} />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render ConnectionStatusBanner with reconnecting failed status', () => {
    const { container } = render(
      <ConnectionStatusBanner status={ConnectionStatus.RECONNECTING_FAILED} />,
    )

    expect(container).toMatchSnapshot()
  })
})
