import { BadgeBackgroundColor } from './Badge.tsx'

export function getBadgePositionBackgroundColor(
  position: number,
): BadgeBackgroundColor {
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
