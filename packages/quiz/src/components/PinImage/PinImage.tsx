import {
  QUESTION_PIN_TOLERANCE_RADIUS,
  QuestionPinTolerance,
} from '@quiz/common'
import React, {
  FC,
  PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { DeviceType, useDeviceSizeType } from '../../utils/use-device-size.tsx'
import ResponsiveImage, { ResponsiveImageProps } from '../ResponsiveImage'

import { clamp01 } from './pin-utils.ts'
import Pin from './Pin.tsx'
import styles from './PinImage.module.scss'
import { PinImagePosition, PinImageValue } from './types.ts'

export type PinImageProps = {
  value?: PinImageValue
  values?: PinImageValue[]
  disabled?: boolean
  onChange?: (position: PinImagePosition) => void
  onValid?: (valid: boolean) => void
} & Pick<ResponsiveImageProps, 'imageURL' | 'alt'>

const PinImage: FC<PinImageProps> = ({
  value,
  values,
  disabled = false,
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
        return 35
      default:
        return 40
    }
  }, [deviceType])

  const [interactivePinPosition, setInteractivePinPosition] = useState<
    PinImagePosition | undefined
  >(
    value
      ? {
          x: clamp01(value.x),
          y: clamp01(value.y),
        }
      : undefined,
  )

  const [positions, setPositions] = useState<PinImageValue[]>()
  useEffect(() => {
    const positions =
      values?.map((v) => ({
        ...v,
        x: clamp01(v.x),
        y: clamp01(v.y),
      })) || []
    setPositions(positions)
  }, [values])

  const roRef = useRef<ResizeObserver | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)
  const [overlaySize, setOverlaySize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  })

  const setOverlayNode = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect()
    roRef.current = null
    overlayRef.current = node
    if (!node) return

    const setIfChanged = (w: number, h: number) =>
      setOverlaySize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))

    const measureNow = () => {
      const r = node.getBoundingClientRect()
      const w = Math.round(r.width)
      const h = Math.round(r.height)
      if (w > 0 && h > 0) setIfChanged(w, h)
    }

    const raf = requestAnimationFrame(measureNow)

    if (typeof ResizeObserver !== 'undefined') {
      roRef.current = new ResizeObserver((entries) => {
        const cr = entries[0]?.contentRect
        if (!cr) return
        const w = Math.round(cr.width)
        const h = Math.round(cr.height)
        if (w > 0 && h > 0) setIfChanged(w, h)
      })
      roRef.current.observe(node)
    }

    const onWinResize = () => measureNow()
    window.addEventListener('resize', onWinResize)

    return () => {
      cancelAnimationFrame(raf)
      roRef.current?.disconnect()
      roRef.current = null
      window.removeEventListener('resize', onWinResize)
    }
  }, [])

  useLayoutEffect(() => {
    const el = overlayRef.current
    if (!el) return

    const setIfChanged = (w: number, h: number) =>
      setOverlaySize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w > 0 && h > 0) setIfChanged(w, h)
    }

    const rafId = requestAnimationFrame(measure)

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect
            if (!cr) return
            const w = Math.round(cr.width)
            const h = Math.round(cr.height)
            if (w > 0 && h > 0) setIfChanged(w, h)
          })
        : null

    ro?.observe(el)

    const onWinResize = () => measure()
    window.addEventListener('resize', onWinResize)

    return () => {
      cancelAnimationFrame(rafId)
      ro?.disconnect()
      window.removeEventListener('resize', onWinResize)
    }
  }, [imageURL])

  const dragRef = useRef<{
    startX: number
    startY: number
    startPx: { x: number; y: number }
  } | null>(null)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current
    if (disabled || !interactivePinPosition || !overlay) return

    const rect = overlay.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPx: {
        x: interactivePinPosition.x * rect.width,
        y: interactivePinPosition.y * rect.height,
      },
    }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !interactivePinPosition || !dragRef.current) return
    const overlay = overlayRef.current
    if (!overlay) return

    const rect = overlay.getBoundingClientRect()
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    const newPxX = dragRef.current.startPx.x + dx
    const newPxY = dragRef.current.startPx.y + dy

    const newX = clamp01(newPxX / rect.width)
    const newY = clamp01(newPxY / rect.height)

    setInteractivePinPosition((prevState) => ({
      ...(prevState || {}),
      x: newX,
      y: newY,
    }))
    if (!value || value.x !== newX || value.y !== newY) {
      onChange?.({ x: newX, y: newY })
      onValid?.(true)
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !interactivePinPosition) return
    dragRef.current = null
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
  }

  const getToleranceDiameterPx = useCallback(
    (tolerance?: QuestionPinTolerance) => {
      if (!overlaySize.w || !overlaySize.h || !tolerance) return 0
      const radius =
        QUESTION_PIN_TOLERANCE_RADIUS[tolerance] *
        Math.min(overlaySize.w, overlaySize.h)
      return Math.max(0, radius * 2)
    },
    [overlaySize],
  )

  return (
    <ResponsiveImage imageURL={imageURL} alt={alt}>
      <div
        ref={setOverlayNode}
        className={styles.overlay}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}>
        {interactivePinPosition && (
          <Pin
            width={pinSizePx}
            height={pinSizePx}
            x={interactivePinPosition.x}
            y={interactivePinPosition.y}
            toleranceDiameterPx={getToleranceDiameterPx(value?.tolerance)}
            color={value?.color}
            disabled={disabled}
          />
        )}

        {positions?.map((p, i) => (
          <Pin
            key={`${p.x}_${p.y}_${i}`}
            width={pinSizePx}
            height={pinSizePx}
            x={p.x}
            y={p.y}
            toleranceDiameterPx={getToleranceDiameterPx(p.tolerance)}
            color={p.color}
            disabled={disabled}
          />
        ))}
      </div>
    </ResponsiveImage>
  )
}

export default PinImage
