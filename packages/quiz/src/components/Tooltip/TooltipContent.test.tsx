import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import TooltipContent from './TooltipContent'

vi.mock('./use-tooltip.context', () => {
  return {
    useTooltipContext: vi.fn(),
  }
})

const mockUseTooltipContext = async () =>
  (await import('./use-tooltip.context'))
    .useTooltipContext as unknown as ReturnType<typeof vi.fn>

describe('TooltipContent', () => {
  it('should render null when tooltip is closed', async () => {
    const useTooltipContext = await mockUseTooltipContext()

    useTooltipContext.mockReturnValue({
      open: false,
      refs: {
        setFloating: vi.fn(),
      },
      floatingStyles: { position: 'absolute' },
      getFloatingProps: <T extends object>(p: T) => p,
    })

    const { container } = render(<TooltipContent />)
    expect(container.firstChild).toBeNull()
  })

  it('should render content in a portal when tooltip is open and merge styles/props', async () => {
    const useTooltipContext = await mockUseTooltipContext()

    const getFloatingProps = vi.fn(<T extends object>(p: T) => ({
      ...p,
      'data-testid': 'tooltip-content',
    }))

    useTooltipContext.mockReturnValue({
      open: true,
      refs: {
        setFloating: vi.fn(),
      },
      floatingStyles: { position: 'absolute', top: 10 },
      getFloatingProps,
    })

    render(
      <TooltipContent
        id="content-id"
        style={{ left: 20, transform: 'translate3d(0, 0, 0)' }}
      />,
    )

    const el = screen.getByTestId('tooltip-content')

    expect(el).toHaveAttribute('id', 'content-id')
    expect(el).toHaveStyle({ position: 'absolute' })
    expect(el).toHaveStyle({ top: '10px' })
    expect(el).toHaveStyle({ left: '20px' })
    expect(el).toHaveStyle({ transform: 'translate3d(0, 0, 0)' })

    expect(getFloatingProps).toHaveBeenCalledTimes(1)
    expect(getFloatingProps).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'content-id',
      }),
    )
  })
})
