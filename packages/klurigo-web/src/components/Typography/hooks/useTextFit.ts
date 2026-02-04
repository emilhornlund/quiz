import { useEffect, useLayoutEffect, useState } from 'react'

import type { TypographyVariant } from '../Typography'

/**
 * Minimum font size threshold in pixels.
 * Text will shrink down to this size, then stop (showing ellipsis if needed).
 */
const MIN_FONT_SIZE = 12

/**
 * Minimum line-height ratio relative to font-size.
 * Line-height must be at least 1.1x the font-size to prevent text clipping.
 */
const MIN_LINE_HEIGHT_RATIO = 1.1

/**
 * Step size in pixels for monotonic font-size reduction.
 * Smaller values = more precise but slower.
 */
const STEP_SIZE = 0.5

/**
 * Breakpoint type derived from media queries.
 */
type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Detects the current device breakpoint based on window width.
 * Must match SCSS breakpoints in helpers.scss.
 */
function getCurrentBreakpoint(): Breakpoint | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null
  }

  // Tablet: min-width 768px and max-width 1023px
  if (window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches) {
    return 'tablet'
  }

  // Desktop: min-width 1024px
  if (window.matchMedia('(min-width: 1024px)').matches) {
    return 'desktop'
  }

  // Mobile: max-width 767px (default)
  return 'mobile'
}

/**
 * Map to cache the original SCSS font size for each element.
 * Key: element reference, Value: max font size in pixels.
 * This prevents reading the fitted font size instead of the original.
 */
const maxFontSizeCache = new WeakMap<HTMLElement, number>()

/**
 * Extracts the current font-size from an element's computed styles.
 * This represents the maximum font-size from variant SCSS.
 *
 * Uses a cache to store the FIRST read value (before any fitting is applied).
 * This prevents the infinite loop caused by reading the fitted size.
 */
function getMaxFontSizeFromElement(element: HTMLElement): number {
  // Check cache first
  const cached = maxFontSizeCache.get(element)
  if (cached !== undefined) {
    return cached
  }

  // First read - this should be the original SCSS value
  const computed = getComputedStyle(element)
  const maxFontSize = parseFloat(computed.fontSize)

  // Cache it for future reads
  maxFontSizeCache.set(element, maxFontSize)

  return maxFontSize
}

/**
 * Parses computed line-height to absolute pixels.
 * Handles unitless (multiplier), px, rem, and normal values.
 */
function parseLineHeight(lineHeight: string, fontSize: number): number {
  if (lineHeight === 'normal') {
    // Browser default: ~1.2
    return fontSize * 1.2
  }

  // Unitless: multiplier of font-size
  if (/^[\d.]+$/.test(lineHeight)) {
    return fontSize * parseFloat(lineHeight)
  }

  // Pixel value
  if (lineHeight.endsWith('px')) {
    return parseFloat(lineHeight)
  }

  // Rem value: convert to px (1rem = 16px default, but respect root font-size)
  if (lineHeight.endsWith('rem')) {
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    return parseFloat(lineHeight) * rootFontSize
  }

  // Fallback: try parsing as float
  const parsed = parseFloat(lineHeight)
  return isNaN(parsed) ? fontSize * 1.2 : parsed
}

/**
 * Measures the unclamped scroll height of text at a given font size.
 * Creates an offscreen measurer element to avoid polluting the DOM.
 */
function measureTextHeight(
  element: HTMLElement,
  text: string,
  fontSize: number,
): number {
  const computed = getComputedStyle(element)

  // Create offscreen measurer
  const measurer = document.createElement('div')
  measurer.style.position = 'absolute'
  measurer.style.visibility = 'hidden'
  measurer.style.pointerEvents = 'none'
  measurer.style.left = '-9999px'
  measurer.style.top = '-9999px'

  // Copy critical layout properties
  const rect = element.getBoundingClientRect()
  if (rect.width <= 0) {
    return 0
  }
  measurer.style.width = `${rect.width}px`
  measurer.style.fontFamily = computed.fontFamily
  measurer.style.fontWeight = computed.fontWeight
  measurer.style.letterSpacing = computed.letterSpacing
  measurer.style.wordBreak = computed.wordBreak
  measurer.style.textAlign = computed.textAlign
  measurer.style.whiteSpace = 'normal'
  measurer.style.wordWrap = 'break-word'
  measurer.style.overflowWrap = 'break-word'

  // Apply font size override
  measurer.style.fontSize = `${fontSize}px`

  // Copy line-height (critical for multi-line calculation)
  measurer.style.lineHeight = computed.lineHeight

  // Remove any clamp/overflow that would hide true height
  measurer.style.overflow = 'visible'
  measurer.style.display = 'block'
  measurer.style.webkitLineClamp = 'unset'
  measurer.style.webkitBoxOrient = 'unset'

  measurer.textContent = text

  document.body.appendChild(measurer)
  const height = measurer.scrollHeight
  document.body.removeChild(measurer)

  return height
}

/**
 * Monotonic font-size fitting algorithm.
 * Starts from maxFontSize and decreases until text fits within maxLines,
 * or reaches MIN_FONT_SIZE.
 *
 * @returns TextFitResult with fitted fontSize and proportional lineHeight, or null if no adjustment needed
 */
function calculateFittedFontSize(
  element: HTMLElement,
  text: string,
  maxLines: number,
  maxFontSize: number,
): TextFitResult | null {
  const computed = getComputedStyle(element)

  // Get the original line-height at max font size to calculate the ratio
  const originalLineHeight = parseLineHeight(computed.lineHeight, maxFontSize)
  let lineHeightRatio = originalLineHeight / maxFontSize

  // Validate ratio - if invalid or too small, use safe default
  // Ratios < 1.0 cause text clipping because line-height becomes smaller than font-size
  if (
    !isFinite(lineHeightRatio) ||
    lineHeightRatio <= 0 ||
    lineHeightRatio < MIN_LINE_HEIGHT_RATIO || // ✅ Prevent clipping
    lineHeightRatio > 3
  ) {
    console.warn(
      `Invalid or unsafe line-height ratio ${lineHeightRatio}, using safe default 1.2`,
    )
    lineHeightRatio = 1.2
  }

  // Test at max size first
  const maxHeight = measureTextHeight(element, text, maxFontSize)
  const targetHeightAtMax = originalLineHeight * maxLines

  // If fits at max, no adjustment needed
  if (maxHeight <= targetHeightAtMax) {
    return null
  }

  // Monotonic shrinking: start from max, decrease by step until it fits
  for (
    let fontSize = maxFontSize;
    fontSize >= MIN_FONT_SIZE;
    fontSize -= STEP_SIZE
  ) {
    const height = measureTextHeight(element, text, fontSize)
    const lineHeight = fontSize * lineHeightRatio // Maintain original ratio
    const targetHeight = lineHeight * maxLines

    // Accept first size where text provably fits (strict inequality for safety)
    if (height <= targetHeight) {
      return {
        fontSize: Math.round(fontSize * 10) / 10, // Round to 1 decimal to prevent floating-point issues
        lineHeight:
          Math.round(
            Math.max(lineHeight, fontSize * MIN_LINE_HEIGHT_RATIO) * 10,
          ) / 10,
      }
    }
  }

  // Text doesn't fit even at minimum - return min with safe line-height
  return {
    fontSize: MIN_FONT_SIZE,
    lineHeight:
      Math.round(
        Math.max(
          MIN_FONT_SIZE * lineHeightRatio,
          MIN_FONT_SIZE * MIN_LINE_HEIGHT_RATIO,
        ) * 10,
      ) / 10, // Round to 1 decimal
  }
}

/**
 * Result of text fitting calculation.
 */
export interface TextFitResult {
  fontSize: number
  lineHeight: number
}

/**
 * Custom hook for dynamic font-size fitting based on max line count.
 *
 * Automatically detects the maximum font-size from the element's computed styles
 * (set by variant SCSS) and monotonically shrinks until text fits within the
 * specified number of lines. Reacts to resize events, font loading, and content changes.
 *
 * @param ref - React ref to the Typography element being measured
 * @param variant - Typography variant (affects font-weight, etc.)
 * @param text - Text content to fit
 * @param maxLines - Maximum number of lines allowed (0 to disable)
 * @returns TextFitResult with fitted font-size and line-height, or null if no adjustment needed
 */
export function useTextFit(
  ref: React.RefObject<HTMLElement | null>,
  variant: TypographyVariant,
  text: string,
  maxLines: number,
): TextFitResult | null {
  const [fittedResult, setFittedResult] = useState<TextFitResult | null>(null)
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(
    getCurrentBreakpoint,
  )

  // Track font loading state
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false)

  // Early return if text fitting is not enabled
  const isEnabled = maxLines > 0 && text.length > 0

  // Handle breakpoint changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const tabletQuery = window.matchMedia(
      '(min-width: 768px) and (max-width: 1023px)',
    )
    const desktopQuery = window.matchMedia('(min-width: 1024px)')

    const updateBreakpoint = () => {
      setBreakpoint(getCurrentBreakpoint())
      // Clear cache when breakpoint changes - new SCSS font size will apply
      if (ref.current) {
        maxFontSizeCache.delete(ref.current)
      }
    }

    mobileQuery.addEventListener('change', updateBreakpoint)
    tabletQuery.addEventListener('change', updateBreakpoint)
    desktopQuery.addEventListener('change', updateBreakpoint)

    return () => {
      mobileQuery.removeEventListener('change', updateBreakpoint)
      tabletQuery.removeEventListener('change', updateBreakpoint)
      desktopQuery.removeEventListener('change', updateBreakpoint)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle font loading
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      setFontsLoaded(true)
      return
    }

    // Check if fonts are already loaded
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true)
      return
    }

    document.fonts.ready
      .then(() => {
        setFontsLoaded(true)
      })
      .catch(() => {
        // Fallback: assume loaded after timeout
        setFontsLoaded(true)
      })
  }, [])

  // Clear cache when variant changes (different SCSS font sizes)
  useEffect(() => {
    if (ref.current) {
      maxFontSizeCache.delete(ref.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  // Recalculate fitted font size
  useLayoutEffect(() => {
    if (!isEnabled || !ref.current || !fontsLoaded) {
      setFittedResult(null)
      return
    }

    const element = ref.current
    const raf = requestAnimationFrame(() => {
      const maxFontSize = getMaxFontSizeFromElement(element)
      const fitted = calculateFittedFontSize(
        element,
        text,
        maxLines,
        maxFontSize,
      )
      setFittedResult((prev) => {
        // Both null - no change
        if (prev === null && fitted === null) return prev

        // One is null, other isn't - changed
        if (prev === null || fitted === null) return fitted

        // Both non-null - check if values changed
        if (
          prev.fontSize === fitted.fontSize &&
          prev.lineHeight === fitted.lineHeight
        ) {
          return prev // No change, keep previous
        }

        return fitted // Changed, update
      })
    })

    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, text, maxLines, fontsLoaded, breakpoint, isEnabled])

  // NOTE: ResizeObserver was removed because it caused infinite loops
  // Text fitting now only recalculates when dependencies change (text, maxLines, breakpoint)
  // This is sufficient for most use cases and prevents the flashing issue

  return fittedResult
}
