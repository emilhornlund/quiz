import { QuestionPinTolerance } from '@klurigo/common'

export type PinImagePosition = {
  x: number
  y: number
}

/**
 * Runtime map of pin colors.
 *
 * These values are used at runtime for UI rendering and styling decisions.
 * Numeric values are intentional to allow compact storage and comparisons.
 */
export const PinColor = {
  Green: 0,
  Red: 1,
  Blue: 2,
  Orange: 3,
} as const

/**
 * Pin color identifier.
 *
 * Possible values:
 * - `Green`
 * - `Red`
 * - `Blue`
 * - `Orange`
 */
export type PinColor = (typeof PinColor)[keyof typeof PinColor]

export type PinImageValue = {
  x: number
  y: number
  tolerance?: QuestionPinTolerance
  color?: PinColor
}
