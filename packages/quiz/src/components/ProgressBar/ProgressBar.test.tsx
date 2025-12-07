import { CountdownEvent } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should render a ProgressBar with initial progress', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:30.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    expect(container).toMatchSnapshot()
  })

  it('should render with 0 progress when countdown has expired', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:02:00.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    expect(container).toMatchSnapshot()
  })

  it('should render with full progress when countdown just started', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:00.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    expect(container).toMatchSnapshot()
  })

  it('should render with 0 progress when dates are invalid', () => {
    const countdown: CountdownEvent = {
      initiatedTime: 'invalid-date',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:00.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    expect(container).toMatchSnapshot()
  })

  it('should render with pulse class when progress is less than 0.1', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:59.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    const progressBar = container.querySelector('span')
    expect(progressBar).toHaveClass('pulse')
    expect(container).toMatchSnapshot()
  })

  it('should not render with pulse class when progress is greater than 0.1', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:30.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    const progressBar = container.querySelector('span')
    expect(progressBar).not.toHaveClass('pulse')
    expect(container).toMatchSnapshot()
  })

  it('should handle countdown prop changes', () => {
    const initialCountdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:30.000Z',
    }

    const { container, rerender } = render(
      <ProgressBar countdown={initialCountdown} />,
    )

    let progressBar = container.querySelector('span')
    expect(progressBar).toHaveStyle('width: 50%')

    const newCountdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:02:00.000Z',
      serverTime: '2023-01-01T00:00:30.000Z',
    }

    rerender(<ProgressBar countdown={newCountdown} />)

    progressBar = container.querySelector('span')
    expect(progressBar).toHaveStyle('width: 75%')
  })

  it('should handle zero total duration', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:00:00.000Z',
      serverTime: '2023-01-01T00:00:00.000Z',
    }

    const { container } = render(<ProgressBar countdown={countdown} />)

    const progressBar = container.querySelector('span')
    expect(progressBar).toHaveStyle('width: 100%')
  })

  it('should cleanup interval on unmount', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:00.000Z',
    }

    const { unmount } = render(<ProgressBar countdown={countdown} />)

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should set up interval when valid countdown provided', () => {
    const countdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:00.000Z',
    }

    const setIntervalSpy = vi.spyOn(global, 'setInterval')
    render(<ProgressBar countdown={countdown} />)

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100)
  })

  it('should clear existing interval when countdown changes', () => {
    const initialCountdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:00:00.000Z',
      expiryTime: '2023-01-01T00:01:00.000Z',
      serverTime: '2023-01-01T00:00:00.000Z',
    }

    const { rerender } = render(<ProgressBar countdown={initialCountdown} />)

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const newCountdown: CountdownEvent = {
      initiatedTime: '2023-01-01T00:01:00.000Z',
      expiryTime: '2023-01-01T00:02:00.000Z',
      serverTime: '2023-01-01T00:01:00.000Z',
    }

    rerender(<ProgressBar countdown={newCountdown} />)

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
