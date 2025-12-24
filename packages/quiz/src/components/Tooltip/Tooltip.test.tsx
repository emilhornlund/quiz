import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Tooltip from './Tooltip'
import type { TooltipOptions } from './tooltip.types'
import { useTooltipContext } from './use-tooltip.context'

vi.mock('./use-tooltip.hook', () => {
  return {
    useTooltip: vi.fn(),
  }
})

const Consumer = () => {
  const ctx = useTooltipContext()
  return <div data-testid="ctx-open">{String(ctx.open)}</div>
}

describe('Tooltip', () => {
  it('should call useTooltip with options and provide context to children', async () => {
    const { useTooltip } = await import('./use-tooltip.hook')

    const provided = {
      open: true,
      refs: {
        setReference: vi.fn(),
        setFloating: vi.fn(),
      },
      floatingStyles: {},
      getReferenceProps: (p: unknown) => p,
      getFloatingProps: (p: unknown) => p,
      setOpen: vi.fn(),
      context: {},
    } as unknown as ReturnType<typeof import('./use-tooltip.hook').useTooltip>

    vi.mocked(useTooltip).mockReturnValue(provided)

    const options: TooltipOptions = {
      initialOpen: false,
      placement: 'bottom',
    }

    render(
      <Tooltip {...options}>
        <Consumer />
      </Tooltip>,
    )

    expect(useTooltip).toHaveBeenCalledTimes(1)
    expect(useTooltip).toHaveBeenCalledWith(options)

    expect(screen.getByTestId('ctx-open').textContent).toBe('true')
  })
})
