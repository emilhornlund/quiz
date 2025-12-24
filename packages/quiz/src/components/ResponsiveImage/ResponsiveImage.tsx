import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { CountdownEvent } from '@quiz/common'
import { QuestionImageRevealEffectType } from '@quiz/common'
import type { FC, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts'

import LoadingSpinner from '../LoadingSpinner'
import Typography from '../Typography'

import { ImageSquareEffect } from './components'
import { useImageBlurEffect } from './hook'
import styles from './ResponsiveImage.module.scss'

export type RevealEffect = {
  type: QuestionImageRevealEffectType
  countdown?: CountdownEvent
}

export type ResponsiveImageProps = {
  imageURL?: string
  alt?: string
  revealEffect?: RevealEffect
  noBorder?: boolean
  children?: ReactNode | ReactNode[]
}

type Phase = 'idle' | 'loading' | 'ready' | 'error'
type Size = { width?: number; height?: number }

const ResponsiveImage: FC<ResponsiveImageProps> = ({
  imageURL,
  alt,
  noBorder = false,
  revealEffect,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [containerSize, setContainerSize] = useState<Size>({
    width: 0,
    height: 0,
  })
  const [intrinsic, setIntrinsic] = useState({ w: 0, h: 0 })
  const [phase, setPhase] = useState<Phase>('idle')
  const [displaySrc, setDisplaySrc] = useState<string | null>(null)

  const applyContainerSize = useCallback((next: Size) => {
    setContainerSize((prev) => {
      const w = Math.round(next.width ?? 0)
      const h = Math.round(next.height ?? 0)
      if ((prev.width ?? 0) === w && (prev.height ?? 0) === h) return prev
      return { width: w, height: h }
    })
  }, [])

  const onResize = useDebounceCallback(applyContainerSize, 80)

  useResizeObserver<HTMLDivElement>({
    // @ts-expect-error (usehooks-ts React 19 types mismatch)
    ref,
    onResize,
    box: 'content-box',
  })

  useEffect(() => {
    if (!imageURL) {
      setPhase('idle')
      setDisplaySrc(null)
      setIntrinsic({ w: 0, h: 0 })
      return
    }

    setPhase('loading')
    setDisplaySrc(null)
    setIntrinsic({ w: 0, h: 0 })

    const img = new Image()
    img.onload = () => {
      setIntrinsic({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 })
      setDisplaySrc(imageURL)
      setPhase('ready')
    }
    img.onerror = () => {
      setDisplaySrc(null)
      setIntrinsic({ w: 0, h: 0 })
      setPhase('error')
    }
    img.src = imageURL

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageURL])

  const box = useMemo<{ w: number; h: number } | undefined>(() => {
    if (phase !== 'ready' || !intrinsic.w || !intrinsic.h) return undefined

    const cw = containerSize.width ?? 0
    const ch = containerSize.height ?? 0
    if (cw <= 0 && ch <= 0) return undefined

    const { w: iw, h: ih } = intrinsic
    const rw = cw > 0 ? cw / iw : Number.POSITIVE_INFINITY
    const rh = ch > 0 ? ch / ih : Number.POSITIVE_INFINITY
    const s = Math.min(rw, rh)

    if (!Number.isFinite(s) || s <= 0) return undefined
    return { w: iw * s, h: ih * s }
  }, [phase, containerSize, intrinsic])

  const blurStyle = useImageBlurEffect(box, revealEffect?.countdown, {
    endAt: 0.1,
  })

  return (
    <div ref={ref} className={styles.container}>
      {phase === 'ready' && displaySrc && box && (
        <div
          className={noBorder ? styles.boxNoBorder : styles.box}
          style={{ width: box.w, height: box.h }}>
          {(revealEffect?.type === QuestionImageRevealEffectType.Square3x3 ||
            revealEffect?.type === QuestionImageRevealEffectType.Square5x5 ||
            revealEffect?.type === QuestionImageRevealEffectType.Square8x8) && (
            <ImageSquareEffect
              countdown={revealEffect.countdown}
              effect={revealEffect.type}
            />
          )}
          <img
            src={displaySrc}
            alt={alt ?? ''}
            className={styles.img}
            style={
              revealEffect?.type === QuestionImageRevealEffectType.Blur
                ? blurStyle
                : undefined
            }
          />
          {children && <div className={styles.overlay}>{children}</div>}
        </div>
      )}

      {phase === 'loading' && (
        <div className={styles.centerOverlay}>
          <LoadingSpinner />
        </div>
      )}

      {phase === 'error' && (
        <div className={styles.centerOverlay}>
          <div className={styles.inner}>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className={styles.icon}
            />
            <Typography variant="subtitle">
              Oh no! Unable to load image
            </Typography>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponsiveImage
