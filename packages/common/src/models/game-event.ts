export enum GameEventType {
  LobbyHost = 'LOBBY_HOST',
  LobbyPlayer = 'LOBBY_PLAYER',
  LeaderboardHost = 'LEADERBOARD_HOST',
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
  leaderboard: { position: number; nickname: string; score: number }[]
}

export type GameEvent = GameEventLobbyHost | GameEventLobbyPlayer
