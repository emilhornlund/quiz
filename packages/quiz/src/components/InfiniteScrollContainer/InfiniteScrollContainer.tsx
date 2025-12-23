import React, {
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './InfiniteScrollContainer.module.scss'

/**
 * Props for {@link InfiniteScrollContainer}.
 */
type InfiniteScrollProps = {
  /**
   * Optional class name applied to the viewport element.
   *
   * Use this to control sizing (e.g. `flex: 1`) in the parent layout.
   */
  className?: string

  /**
   * Enables or disables auto-scrolling when content overflows.
   *
   * When disabled, the component still renders and applies alignment, but the
   * content remains static.
   */
  enabled?: boolean

  /**
   * Scroll speed expressed as pixels per second.
   *
   * Higher values produce faster scrolling. For large title typography, values
   * around 70–120 px/s typically feel natural depending on line-height.
   */
  pxPerSecond?: number

  /**
   * Vertical spacing in pixels inserted between the first and second copy of the
   * content when looping.
   *
   * This creates visual separation and defines the loop distance together with
   * the content height.
   */
  gapPx?: number

  /**
   * Horizontal alignment of the content within the viewport.
   *
   * - `center` centers the content block horizontally.
   * - `start` aligns the content to the left.
   */
  hAlign?: 'start' | 'center'

  /**
   * Vertical alignment of the content within the viewport when the content does
   * not overflow.
   *
   * When the content overflows and auto-scrolling is active, the component
   * forces top alignment to ensure the first line is visible before scrolling.
   */
  vAlign?: 'start' | 'center'

  /**
   * description here
   */
  startDelayMs?: number

  /**
   * Content to render and optionally loop.
   *
   * The component will duplicate this content when it overflows the viewport in
   * order to create a seamless infinite loop.
   */
  children: ReactNode
}

/**
 * Renders content inside a fixed-height viewport and automatically scrolls it
 * vertically in an infinite loop when it overflows.
 *
 * Behavior:
 * - If the content height is less than or equal to the viewport height, the
 *   content is rendered once and can be vertically centered via `vAlign`.
 * - If the content height exceeds the viewport height, the content is rendered
 *   twice with `gapPx` spacing, and the track is translated upward to create an
 *   endless scrolling loop.
 *
 * The scrolling uses `requestAnimationFrame` and a `ResizeObserver` to react to
 * layout changes.
 *
 * @param className - Optional class name applied to the viewport element.
 * @param enabled - Enables/disables auto-scrolling when content overflows.
 * @param pxPerSecond - Scroll speed in pixels per second.
 * @param gapPx - Spacing between the two duplicated blocks when looping.
 * @param hAlign - Horizontal content alignment (`start` or `center`).
 * @param vAlign - Vertical content alignment when not looping (`start` or `center`).
 * @param children - Content to render and optionally loop.
 * @returns A viewport that aligns and optionally scrolls its content infinitely.
 */
const InfiniteScrollContainer: FC<InfiniteScrollProps> = ({
  className,
  enabled = true,
  pxPerSecond = 18,
  gapPx = 24,
  hAlign = 'center',
  vAlign = 'start',
  startDelayMs = 1000,
  children,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const firstRef = useRef<HTMLDivElement | null>(null)

  const [shouldLoop, setShouldLoop] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loopHeight, setLoopHeight] = useState(0)

  useEffect(() => {
    const viewport = viewportRef.current
    const first = firstRef.current
    if (!viewport || !first) return

    const recompute = () => {
      const firstHeight = first.offsetHeight
      const viewportHeight = viewport.clientHeight
      const needsLoop = firstHeight > viewportHeight

      setShouldLoop(needsLoop)
      setLoopHeight(needsLoop ? firstHeight + gapPx : 0)
      setOffset(0)
    }

    recompute()

    const ro = new ResizeObserver(recompute)
    ro.observe(viewport)
    ro.observe(first)
    return () => ro.disconnect()
  }, [children, gapPx])

  useEffect(() => {
    if (!enabled || !shouldLoop || loopHeight <= 0) return

    let raf = 0
    let last = performance.now()
    const startAt = last + startDelayMs // or startDelayMs if fixed

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)

      // Hold still for the delay so the first line is readable.
      if (now < startAt) {
        last = now
        return
      }

      const dt = (now - last) / 1000
      last = now

      const delta = pxPerSecond * dt
      setOffset((prev) => {
        const next = prev + delta
        return next >= loopHeight ? next - loopHeight : next
      })
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled, shouldLoop, loopHeight, pxPerSecond, startDelayMs])

  const blocks = useMemo(() => (shouldLoop ? [0, 1] : [0]), [shouldLoop])

  const hClass = hAlign === 'center' ? styles.hCenter : styles.hStart
  const vClass =
    !shouldLoop && vAlign === 'center' ? styles.vCenter : styles.vStart

  return (
    <div
      ref={viewportRef}
      className={classNames(styles.viewport, hClass, vClass, className)}>
      <div
        className={styles.track}
        style={{
          transform: shouldLoop ? `translateY(-${offset}px)` : undefined,
        }}>
        {blocks.map((idx) => (
          <React.Fragment key={idx}>
            <div
              ref={idx === 0 ? firstRef : undefined}
              className={styles.block}>
              {children}
            </div>
            {idx === 0 && shouldLoop ? (
              <div className={styles.gap} style={{ height: gapPx }} />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default InfiniteScrollContainer
