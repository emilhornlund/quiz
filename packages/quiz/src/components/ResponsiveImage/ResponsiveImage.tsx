import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, {
  FC,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { LoadingSpinner, Typography } from '../index.ts'

import styles from './ResponsiveImage.module.scss'

export interface ResponsiveImageProps {
  imageURL?: string
  alt?: string
  noBorder?: boolean
  children?: ReactNode | ReactNode[]
}

type Phase = 'idle' | 'loading' | 'ready' | 'error'

const ResponsiveImage: FC<ResponsiveImageProps> = ({
  imageURL,
  alt,
  noBorder = false,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState({ w: 0, h: 0 })
  const [intrinsic, setIntrinsic] = useState({ w: 0, h: 0 })
  const [phase, setPhase] = useState<Phase>('idle')
  const [displaySrc, setDisplaySrc] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect
      if (r) setContainer({ w: r.width, h: r.height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

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
    const { w: cw, h: ch } = container
    const { w: iw, h: ih } = intrinsic

    if (cw > 0 && ch > 0) {
      const s = Math.min(cw / iw, ch / ih)
      return { w: Math.floor(iw * s), h: Math.floor(ih * s) }
    }
    if (cw > 0) {
      const s = cw / iw
      return { w: Math.floor(iw * s), h: Math.floor(ih * s) }
    }
    if (ch > 0) {
      const s = ch / ih
      return { w: Math.floor(iw * s), h: Math.floor(ih * s) }
    }
    return null
  }, [phase, container, intrinsic])

  return (
    <div ref={containerRef} className={styles.container}>
      {phase === 'ready' && displaySrc && box && (
        <div
          className={noBorder ? styles.boxNoBorder : styles.box}
          style={{ width: box.w, height: box.h }}>
          <img src={displaySrc} alt={alt ?? ''} className={styles.img} />
          {children && <div className={styles.overlay}>{children}</div>}
        </div>
      )}

      {phase === 'ready' && displaySrc && !box && (
        <div className={noBorder ? styles.boxNoBorder : styles.box}>
          <img src={displaySrc} alt={alt ?? ''} className={styles.imgLoose} />
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
