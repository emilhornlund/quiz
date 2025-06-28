import { Authority } from '@quiz/common'

export const DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME = '15m'
export const DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME = '15m'

export const DEFAULT_GAME_AUTHORITIES: Authority[] = [Authority.Game]
export const DEFAULT_USER_AUTHORITIES: Authority[] = [
  Authority.Game,
  Authority.Media,
  Authority.Quiz,
  Authority.User,
]
export const DEFAULT_REFRESH_AUTHORITIES: Authority[] = [Authority.RefreshAuth]
