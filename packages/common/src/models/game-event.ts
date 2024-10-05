export enum GameEventType {
  LobbyHost = 'LOBBY_HOST',
  LobbyPlayer = 'LOBBY_PLAYER',
  LeaderboardHost = 'LEADERBOARD_HOST',
  ResultPlayer = 'RESULT_PLAYER',
}

export type GameEventLobbyHost = {
  type: GameEventType.LobbyHost
  url: string
  pin: string
  players: string[]
}

export type GameEventLobbyPlayer = {
  type: GameEventType.LobbyPlayer
  nickname: string
}

export type GameEventLeaderboardHost = {
  type: GameEventType.LeaderboardHost
  gamePIN: string
  leaderboard: { position: number; nickname: string; score: number }[]
  pagination: {
    current: number
    total: number
  }
}

export type GameEventResultPlayer = {
  type: GameEventType.ResultPlayer
  nickname: string
  correct: boolean
  score: {
    last: number
    total: number
    position: number
    streak: number
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameEvent =
  | GameEventLobbyHost
  | GameEventLobbyPlayer
  | GameEventQuestionHost
  | GameEventLeaderboardHost
  | GameEventResultPlayer
