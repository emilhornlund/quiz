import { QuestionPinTolerance } from '@quiz/common'

export type PinImagePosition = {
  x: number
  y: number
}

export enum PinColor {
  Green,
  Red,
  Blue,
  Orange,
}

export type PinImageValue = {
  x: number
  y: number
  tolerance?: QuestionPinTolerance
  color?: PinColor
}
