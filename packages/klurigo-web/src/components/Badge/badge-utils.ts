import type { BadgeColor } from './Badge'

export function getBadgePositionBackgroundColor(position: number): BadgeColor {
  switch (Math.max(position, 1)) {
    case 1:
      return 'gold'
    case 2:
      return 'silver'
    case 3:
      return 'bronze'
    default:
      return 'white'
  }
}

export function getBadgePositionTextColor(position: number): BadgeColor {
  switch (Math.max(position, 1)) {
    case 1:
    case 2:
    case 3:
      return 'white'
    default:
      return 'black'
  }
}
