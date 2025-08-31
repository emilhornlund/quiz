import colors from '../../styles/colors.module.scss'

import { PinColor } from './types.ts'

const roundTo = (v: number, decimals: number) =>
  Math.round((v + Number.EPSILON) * Math.pow(10, decimals)) /
  Math.pow(10, decimals)

export const clamp01 = (v: number) => roundTo(Math.max(0, Math.min(1, v)), 5)

export function getPinColorColor(color: PinColor): string {
  switch (color) {
    case PinColor.Red:
      return colors.red2
    case PinColor.Green:
      return colors.green2
    case PinColor.Blue:
    default:
      return colors.blue2
  }
}
