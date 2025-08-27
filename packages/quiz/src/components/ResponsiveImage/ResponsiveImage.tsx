import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts'

import { LoadingSpinner, Typography } from '../index.ts'

import styles from './ResponsiveImage.module.scss'

export interface ResponsiveImageProps {
  imageURL?: string
  alt?: string
  noBorder?: boolean
  children?: ReactNode | ReactNode[]
}

type Phase = 'idle' | 'loading' | 'ready' | 'error'
type Size = { width?: number; height?: number }

const ResponsiveImage: FC<ResponsiveImageProps> = ({
  imageURL,
  alt,
  noBorder = false,
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

  const box = useMemo(() => {
    if (phase !== 'ready' || !intrinsic.w || !intrinsic.h) return null

    const cw = containerSize.width ?? 0
    const ch = containerSize.height ?? 0
    if (cw <= 0 && ch <= 0) return null

    const { w: iw, h: ih } = intrinsic
    const rw = cw > 0 ? cw / iw : Number.POSITIVE_INFINITY
    const rh = ch > 0 ? ch / ih : Number.POSITIVE_INFINITY
    const s = Math.min(rw, rh)

    if (!Number.isFinite(s) || s <= 0) return null
    return { w: iw * s, h: ih * s }
  }, [phase, containerSize, intrinsic])

  return (
    <div ref={ref} className={styles.container}>
      {phase === 'ready' && displaySrc && box && (
        <div
          className={noBorder ? styles.boxNoBorder : styles.box}
          style={{ width: box.w, height: box.h }}>
          <img src={displaySrc} alt={alt ?? ''} className={styles.img} />
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
