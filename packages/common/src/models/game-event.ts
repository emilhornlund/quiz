export enum GameEventType {
  Lobby = 'LOBBY',
}

export type GameEventLobby = {
  type: GameEventType.Lobby
  url: string
  pin: string
  players: string[]
}

export type GameEvent = GameEventLobby
