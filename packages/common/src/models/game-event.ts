export enum GameEventType {
  LobbyHost = 'LOBBY_HOST',
  LobbyPlayer = 'LOBBY_PLAYER',
  GameBeginHost = 'GAME_BEGIN_HOST',
  GameBeginPlayer = 'GAME_BEGIN_PLAYER',
  GameQuestionPreviewHost = 'GAME_QUESTION_PREVIEW_HOST',
  GameQuestionPreviewPlayer = 'GAME_QUESTION_PREVIEW_PLAYER',
  QuestionHost = 'QUESTION_HOST',
  QuestionPlayer = 'QUESTION_PLAYER',
  AwaitingResultPlayer = 'AWAITING_RESULT_PLAYER',
  LeaderboardHost = 'LEADERBOARD_HOST',
  ResultHost = 'RESULT_HOST',
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

export type GameEventAwaitingResultPlayer = {
  type: GameEventType.AwaitingResultPlayer
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
  type: GameEventType.ResultHost
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
