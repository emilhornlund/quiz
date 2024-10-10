export enum GameEventType {
  LobbyHost = 'LOBBY_HOST',
  LobbyPlayer = 'LOBBY_PLAYER',
  QuestionHost = 'QUESTION_HOST',
  QuestionPlayer = 'QUESTION_PLAYER',
  LeaderboardHost = 'LEADERBOARD_HOST',
  ResultPlayer = 'RESULT_PLAYER',
  PodiumHost = 'PODIUM_HOST',
  PodiumPlayer = 'PODIUM_PLAYER',
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

export enum GameEventQuestionType {
  Multi = 'MULTI',
  Slider = 'SLIDER',
  TrueFalse = 'TRUE_FALSE',
  TypeAnswer = 'TYPE_ANSWER',
}

export type GameEventQuestionMulti = {
  type: GameEventQuestionType.Multi
  question: string
  imageURL?: string
  answers: { value: string }[]
  duration: number
}

export type GameEventQuestionSlider = {
  type: GameEventQuestionType.Slider
  question: string
  imageURL?: string
  min: number
  max: number
  step: number
  duration: number
}

export type GameEventQuestionTrueFalse = {
  type: GameEventQuestionType.TrueFalse
  question: string
  imageURL?: string
  duration: number
}

export type GameEventQuestionTypeAnswer = {
  type: GameEventQuestionType.TypeAnswer
  question: string
  imageURL?: string
  duration: number
}

export type GameEventQuestion =
  | GameEventQuestionMulti
  | GameEventQuestionSlider
  | GameEventQuestionTrueFalse
  | GameEventQuestionTypeAnswer

export type GameEventQuestionHost = {
  type: GameEventType.QuestionHost
  gamePIN: string
  question: GameEventQuestion
  submissions: {
    current: number
    total: number
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameEventQuestionPlayer = {
  type: GameEventType.QuestionPlayer
  nickname: string
  question: GameEventQuestion
  time: number
  score: {
    total: number
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameEventLeaderboardHost = {
  type: GameEventType.LeaderboardHost
  gamePIN: string
  leaderboard: {
    position: number
    nickname: string
    score: number
    streaks: number
  }[]
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

export type GameEventPodiumHost = {
  type: GameEventType.PodiumHost
  leaderboard: { position: number; nickname: string; score: number }[]
}

export type GameEventPodiumPlayer = {
  type: GameEventType.PodiumPlayer
  title: string
  nickname: string
  position: number
  score: number
}

export type GameEvent =
  | GameEventLobbyHost
  | GameEventLobbyPlayer
  | GameEventQuestionHost
  | GameEventQuestionPlayer
  | GameEventLeaderboardHost
  | GameEventResultPlayer
  | GameEventPodiumHost
  | GameEventPodiumPlayer
