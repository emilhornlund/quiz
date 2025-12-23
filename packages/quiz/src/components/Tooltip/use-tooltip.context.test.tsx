import { renderHook } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { TooltipContext, useTooltipContext } from './use-tooltip.context'

describe('useTooltipContext', () => {
  it('should throw when used outside of <Tooltip />', () => {
    expect(() => renderHook(() => useTooltipContext())).toThrow(
      'Tooltip components must be wrapped in <Tooltip />',
    )
  })

  it('should return the context value when used within a provider', () => {
    const value = {
      open: false,
    } as unknown as ReturnType<typeof import('./use-tooltip.hook').useTooltip>

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TooltipContext.Provider value={value}>
        {children}
      </TooltipContext.Provider>
    )

    const { result } = renderHook(() => useTooltipContext(), { wrapper })

    expect(result.current).toBe(value)
  })
})
