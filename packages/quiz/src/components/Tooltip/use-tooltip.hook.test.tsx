import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@floating-ui/react', () => {
  const useFloating = vi.fn(() => ({
    context: { __ctx: true },
    refs: {
      setReference: vi.fn(),
      setFloating: vi.fn(),
    },
    floatingStyles: { position: 'absolute' },
  }))

  const useHover = vi.fn(() => ({ __hover: true }))
  const useFocus = vi.fn(() => ({ __focus: true }))
  const useDismiss = vi.fn(() => ({ __dismiss: true }))
  const useRole = vi.fn(() => ({ __role: true }))
  const useInteractions = vi.fn(() => ({
    getReferenceProps: vi.fn(<T extends object>(p: T) => p),
    getFloatingProps: vi.fn(<T extends object>(p: T) => p),
  }))

  const autoUpdate = vi.fn()
  const offset = vi.fn((n: number) => ({ name: 'offset', n }))
  const flip = vi.fn((opts: unknown) => ({ name: 'flip', opts }))
  const shift = vi.fn((opts: unknown) => ({ name: 'shift', opts }))

  return {
    autoUpdate,
    flip,
    offset,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
  }
})

import { useTooltip } from './use-tooltip.hook'

describe('useTooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should default to placement="top" and open=false', async () => {
    const floating = await import('@floating-ui/react')

    const { result } = renderHook(() => useTooltip())

    expect(result.current.open).toBe(false)

    expect(floating.useFloating).toHaveBeenCalledTimes(1)
    expect(floating.useFloating).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'top',
        open: false,
      }),
    )
  })

  it('should respect initialOpen when uncontrolled', async () => {
    const floating = await import('@floating-ui/react')

    const { result } = renderHook(() => useTooltip({ initialOpen: true }))

    expect(result.current.open).toBe(true)

    expect(floating.useHover).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: true }),
    )
    expect(floating.useFocus).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: true }),
    )
  })

  it('should use controlled open state and disable hover/focus interactions', async () => {
    const floating = await import('@floating-ui/react')

    const onOpenChange = vi.fn()

    const { result } = renderHook(() =>
      useTooltip({
        open: true,
        onOpenChange,
        placement: 'bottom',
      }),
    )

    expect(result.current.open).toBe(true)
    expect(result.current.setOpen).toBe(onOpenChange)

    expect(floating.useFloating).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'bottom',
        open: true,
      }),
    )

    expect(floating.useHover).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    )
    expect(floating.useFocus).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ enabled: false }),
    )
  })

  it('should wire role="tooltip" and include dismiss interaction', async () => {
    const floating = await import('@floating-ui/react')

    renderHook(() => useTooltip())

    expect(floating.useRole).toHaveBeenCalledWith(expect.anything(), {
      role: 'tooltip',
    })
    expect(floating.useDismiss).toHaveBeenCalledTimes(1)
    expect(floating.useInteractions).toHaveBeenCalledTimes(1)
  })
})
