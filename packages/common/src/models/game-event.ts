export enum GameEventType {
  GameLobbyHost = 'GAME_LOBBY_HOST',
  GameLobbyPlayer = 'GAME_LOBBY_PLAYER',
  GameBeginHost = 'GAME_BEGIN_HOST',
  GameBeginPlayer = 'GAME_BEGIN_PLAYER',
  GameQuestionPreviewHost = 'GAME_QUESTION_PREVIEW_HOST',
  GameQuestionPreviewPlayer = 'GAME_QUESTION_PREVIEW_PLAYER',
  GameQuestionHost = 'GAME_QUESTION_HOST',
  GameQuestionPlayer = 'GAME_QUESTION_PLAYER',
  GameAwaitingResultPlayer = 'GAME_AWAITING_RESULT_PLAYER',
  GameLeaderboardHost = 'GAME_LEADERBOARD_HOST',
  GameResultHost = 'GAME_RESULT_HOST',
  GameResultPlayer = 'GAME_RESULT_PLAYER',
  GamePodiumHost = 'GAME_PODIUM_HOST',
  GamePodiumPlayer = 'GAME_PODIUM_PLAYER',
}

export type GameEventLobbyHost = {
  type: GameEventType.GameLobbyHost
  url: string
  pin: string
  players: string[]
}

export type GameEventLobbyPlayer = {
  type: GameEventType.GameLobbyPlayer
  nickname: string
}

export type GameEventGameBeginHost = {
  type: GameEventType.GameBeginHost
}

export type GameEventGameBeginPlayer = {
  type: GameEventType.GameBeginPlayer
  nickname: string
}

export type GameEventGameQuestionPreviewHost = {
  type: GameEventType.GameQuestionPreviewHost
  game: {
    pin: string
  }
  question: {
    type: GameEventQuestionType
    question: string
  }
  progress: {
    value: number
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameEventGameQuestionPreviewPlayer = {
  type: GameEventType.GameQuestionPreviewPlayer
  player: {
    nickname: string
    score: number
  }
  question: {
    type: GameEventQuestionType
    question: string
  }
  progress: {
    value: number
  }
  pagination: {
    current: number
    total: number
  }
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
  type: GameEventType.GameQuestionHost
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
  type: GameEventType.GameQuestionPlayer
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

export type GameEventAwaitingResultPlayer = {
  type: GameEventType.GameAwaitingResultPlayer
  nickname: string
  score: {
    total: number
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameEventLeaderboardHost = {
  type: GameEventType.GameLeaderboardHost
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

export type GameEventQuestionResultsMulti = {
  type: GameEventQuestionType.Multi
  distribution: { value: string; count: number; correct: boolean }[]
}

export type GameEventQuestionResultsSlider = {
  type: GameEventQuestionType.Slider
  distribution: { value: number; count: number; correct: boolean }[]
}

export type GameEventQuestionResultsTrueFalse = {
  type: GameEventQuestionType.TrueFalse
  distribution: { value: boolean; count: number; correct: boolean }[]
}

export type GameEventQuestionResultsTypeAnswer = {
  type: GameEventQuestionType.TypeAnswer
  distribution: { value: string; count: number; correct: boolean }[]
}

export type GameEventQuestionResults =
  | GameEventQuestionResultsMulti
  | GameEventQuestionResultsSlider
  | GameEventQuestionResultsTrueFalse
  | GameEventQuestionResultsTypeAnswer

export type GameEventResultHost = {
  type: GameEventType.GameResultHost
  game: {
    pin: string
  }
  question: {
    type: GameEventQuestionType
    question: string
  }
  results: GameEventQuestionResults
  pagination: {
    current: number
    total: number
  }
}

export type GameEventResultPlayer = {
  type: GameEventType.GameResultPlayer
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
  type: GameEventType.GamePodiumHost
  leaderboard: { position: number; nickname: string; score: number }[]
}

export type GameEventPodiumPlayer = {
  type: GameEventType.GamePodiumPlayer
  title: string
  nickname: string
  position: number
  score: number
}

export type GameEvent =
  | GameEventLobbyHost
  | GameEventLobbyPlayer
  | GameEventGameBeginHost
  | GameEventGameBeginPlayer
  | GameEventGameQuestionPreviewHost
  | GameEventGameQuestionPreviewPlayer
  | GameEventQuestionHost
  | GameEventQuestionPlayer
  | GameEventAwaitingResultPlayer
  | GameEventLeaderboardHost
  | GameEventResultHost
  | GameEventResultPlayer
  | GameEventPodiumHost
  | GameEventPodiumPlayer
