export enum GameEventType {
  LobbyHost = 'LOBBY_HOST',
  LobbyPlayer = 'LOBBY_PLAYER',
}

export type GameEventLobbyHost = {
  type: GameEventType.LobbyHost
  url: string
  pin: string
  players: string[]
}

export type GameEventPlayerLobby = {
  type: GameEventType.LobbyPlayer
  nickname: string
}

export type GameEvent = GameEventLobbyHost | GameEventPlayerLobby
