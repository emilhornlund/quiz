import {
  calculateRangeBounds,
  clamp,
  QuestionRangeAnswerMargin,
  snapToStep,
} from '@quiz/common'
import React, { FC, useCallback, useId, useMemo } from 'react'

import { classNames } from '../../utils/helpers.ts'

import styles from './Slider.module.scss'

const formatDisplay = (n: number) => (Number.isFinite(n) ? Math.round(n) : n)

export type SliderProps = {
  id?: string
  min?: number
  max?: number
  step?: number
  value?: number
  margin?: QuestionRangeAnswerMargin
  showMinMax?: boolean
  correct?: boolean
  onChange?: (value: number) => void
}

const Slider: FC<SliderProps> = ({
  id,
  min = 0,
  max = 100,
  step = 2,
  value,
  margin,
  showMinMax = false,
  correct = false,
  onChange,
}) => {
  const internalValue = useMemo(() => {
    const v = value ?? (min + max) / 2
    const clamped = clamp(v, min, max)
    const snapped = snapToStep(clamped, min, step)
    return Number.isFinite(snapped) ? snapped : clamped
  }, [value, min, max, step])

  const ticks = useMemo(() => {
    const EPS = 1e-9
    const range = max - min
    if (range < 0) return []

    const steps = Math.floor(range / step)
    const arr = Array.from({ length: steps + 1 }, (_, i) => {
      const v = min + i * step
      return Math.round((v + Number.EPSILON) * 1e6) / 1e6
    })

    const last = arr[arr.length - 1]
    if (Math.abs(last - max) > EPS) arr.push(max)
    return arr
  }, [min, max, step])

  const { lower, upper } = useMemo(
    () =>
      margin
        ? calculateRangeBounds(margin, internalValue, min, max, step)
        : { lower: min, upper: max },
    [margin, internalValue, min, max, step],
  )

  const ticksMargin = useMemo(
    () => (upper - lower) / step,
    [upper, lower, step],
  )

  const isTickInRange = useCallback(
    (tick: number) => !!margin && tick >= lower && tick <= upper,
    [margin, lower, upper],
  )

  const styleVars = useMemo(
    () =>
      ({
        '--ticks': String(ticks.length),
        '--p': String(clamp((internalValue - min) / (max - min || 1), 0, 1)),
        '--ticks-margin': String(ticksMargin),
      }) as React.CSSProperties,
    [ticks.length, internalValue, min, max, ticksMargin],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(Number(e.target.value))
    },
    [onChange],
  )

  const autoId = useId()
  const inputId = id ?? `slider-${autoId}`

  return (
    <div className={styles.slider} style={styleVars}>
      <div className={styles.sliderBackground} />

      <div className={styles.sliderTicks}>
        {ticks.map((tick, i) => (
          <span
            key={`tick_${i}`}
            className={classNames(
              styles.sliderTick,
              isTickInRange(tick) ? styles.active : undefined,
            )}
          />
        ))}
      </div>

      {margin && (
        <div className={styles.sliderOverlayContainer}>
          <div className={styles.sliderOverlay} aria-hidden />
        </div>
      )}

      <div
        className={classNames(
          styles.sliderBubble,
          styles.sliderCenterValueBubble,
          correct ? styles.sliderCenterCorrectBubble : undefined,
        )}
        role="tooltip"
        aria-hidden>
        {formatDisplay(internalValue)}
      </div>

      {showMinMax && (
        <>
          <div
            className={classNames(
              styles.sliderBubble,
              styles.sliderBoundsBubble,
              styles.sliderMinBoundsBubble,
            )}
            role="tooltip"
            aria-hidden>
            {formatDisplay(min)}
          </div>
          <div
            className={classNames(
              styles.sliderBubble,
              styles.sliderBoundsBubble,
              styles.sliderMaxBoundsBubble,
            )}
            role="tooltip"
            aria-hidden>
            {formatDisplay(max)}
          </div>
        </>
      )}

      {margin && (
        <div
          className={classNames(
            styles.sliderBubble,
            styles.sliderMarginBubble,
            styles.sliderLowerMarginBubble,
          )}
          role="tooltip"
          aria-hidden>
          {formatDisplay(lower)}
        </div>
      )}

      {margin && (
        <div
          className={classNames(
            styles.sliderBubble,
            styles.sliderMarginBubble,
            styles.sliderUpperMarginBubble,
          )}
          role="tooltip"
          aria-hidden>
          {formatDisplay(upper)}
        </div>
      )}

      <input
        id={inputId}
        className={styles.sliderInput}
        type="range"
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        aria-valuetext={String(formatDisplay(internalValue))}
      />
    </div>
  )
}

export default Slider
