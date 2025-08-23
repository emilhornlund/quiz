import {
  QUESTION_PIN_TOLERANCE_RADIUS,
  QuestionPinTolerance,
} from '@quiz/common'
import React, {
  FC,
  PointerEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { DeviceType, useDeviceSizeType } from '../../utils/use-device-size.tsx'
import { ResponsiveImage, ResponsiveImageProps } from '../index.ts'

import styles from './PinImage.module.scss'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export type PinImageProps = {
  /** initial position in [0,1] */
  positionX?: number
  positionY?: number
  /** tolerance **/
  tolerance?: QuestionPinTolerance
  /** notify parent when user drags the pin */
  onChange?: (pos: { x: number; y: number }) => void
  onValid?: (valid: boolean) => void
} & Pick<ResponsiveImageProps, 'imageURL' | 'alt'>

const PinImage: FC<PinImageProps> = ({
  positionX = 0.5,
  positionY = 0.5,
  tolerance,
  imageURL,
  alt,
  onChange,
  onValid,
}) => {
  const deviceType = useDeviceSizeType()

  const pinSizePx = useMemo(() => {
    switch (deviceType) {
      case DeviceType.Mobile:
        return 30
      case DeviceType.Tablet:
        return 40
      default:
        return 50
    }
  }, [deviceType])

  // percentage state (0..1)
  const [pos, setPos] = useState({
    x: clamp01(positionX),
    y: clamp01(positionY),
  })

  // drag state
  const overlayRef = useRef<HTMLDivElement>(null)
  const [overlaySize, setOverlaySize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  })

  // find the <img> that ResponsiveImage renders, starting from our overlay
  function getImageEl(): HTMLImageElement | null {
    let node: Element | null = overlayRef.current
    while (node && !(node.previousElementSibling instanceof HTMLImageElement)) {
      node = node.parentElement // walk up until a sibling <img> exists
    }
    return (node?.previousElementSibling as HTMLImageElement) || null
  }

  useLayoutEffect(() => {
    const measure = () => {
      const img = getImageEl()
      if (!img) return
      const r = img.getBoundingClientRect()
      setOverlaySize({ w: Math.round(r.width), h: Math.round(r.height) })
    }

    // initial measure
    measure()

    // observe the <img> itself so we get size changes
    const img = getImageEl()
    const ro =
      img && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => measure())
        : null
    if (img) ro?.observe(img)

    // also track viewport changes
    const onWinResize = () => measure()
    window.addEventListener('resize', onWinResize)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', onWinResize)
    }
  }, [imageURL]) // re-measure when URL changes

  const dragRef = useRef<{
    startX: number
    startY: number
    startPx: { x: number; y: number }
  } | null>(null)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // start dragging anywhere on the overlay
    const overlay = overlayRef.current
    if (!overlay) return

    const rect = overlay.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPx: { x: pos.x * rect.width, y: pos.y * rect.height },
    }

    // capture pointer so moves outside still count
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const overlay = overlayRef.current
    if (!overlay) return

    const rect = overlay.getBoundingClientRect()
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    // new pixel position relative to overlay
    const newPxX = dragRef.current.startPx.x + dx
    const newPxY = dragRef.current.startPx.y + dy

    // convert to % and clamp
    const newX = clamp01(newPxX / rect.width)
    const newY = clamp01(newPxY / rect.height)

    setPos({ x: newX, y: newY })
    onChange?.({ x: newX, y: newY })
    onValid?.(true)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  // Compute tolerance circle diameter in px
  const tolDiameterPx = useMemo(() => {
    if (!overlaySize.w || !overlaySize.h || !tolerance) return 0
    const radius =
      QUESTION_PIN_TOLERANCE_RADIUS[tolerance] *
      Math.min(overlaySize.w, overlaySize.h)
    return Math.max(0, radius * 2)
  }, [tolerance, overlaySize])

  return (
    <div className={styles.pinImage}>
      <ResponsiveImage imageURL={imageURL} alt={alt}>
        {/* overlay that matches the fitted image box */}
        <div
          ref={overlayRef}
          className={styles.overlay}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <div
            className={styles.pin}
            style={{
              width: pinSizePx,
              height: pinSizePx,
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
            }}
            aria-label="Draggable pin">
            {tolDiameterPx > 0 && (
              <div
                className={styles.tolerance}
                style={{ width: '100px', height: '100px' }}
              />
            )}

            <div className={styles.dot} />
          </div>
        </div>
      </ResponsiveImage>
    </div>
  )
}

export default PinImage
