import { QuestionType } from './question-type.enum'

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

export type GameLobbyHostEvent = {
  type: GameEventType.GameLobbyHost
  url: string
  pin: string
  players: string[]
}

export type GameLobbyPlayerEvent = {
  type: GameEventType.GameLobbyPlayer
  nickname: string
}

export type GameGameBeginHostEvent = {
  type: GameEventType.GameBeginHost
}

export type GameGameBeginPlayerEvent = {
  type: GameEventType.GameBeginPlayer
  nickname: string
}

export type GameQuestionPreviewHostEvent = {
  type: GameEventType.GameQuestionPreviewHost
  game: {
    pin: string
  }
  question: {
    type: QuestionType
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

export type GameQuestionPreviewPlayerEvent = {
  type: GameEventType.GameQuestionPreviewPlayer
  player: {
    nickname: string
    score: number
  }
  question: {
    type: QuestionType
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

export type GameEventQuestionMulti = {
  type: QuestionType.Multi
  question: string
  imageURL?: string
  answers: { value: string }[]
  duration: number
}

export type GameEventQuestionSlider = {
  type: QuestionType.Slider
  question: string
  imageURL?: string
  min: number
  max: number
  step: number
  duration: number
}

export type GameEventQuestionTrueFalse = {
  type: QuestionType.TrueFalse
  question: string
  imageURL?: string
  duration: number
}

export type GameEventQuestionTypeAnswer = {
  type: QuestionType.TypeAnswer
  question: string
  imageURL?: string
  duration: number
}

export type GameEventQuestion =
  | GameEventQuestionMulti
  | GameEventQuestionSlider
  | GameEventQuestionTrueFalse
  | GameEventQuestionTypeAnswer

export type GameQuestionHostEvent = {
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

export type GameQuestionPlayerEvent = {
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

export type GameAwaitingResultPlayerEvent = {
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

export type GameLeaderboardHostEvent = {
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
  type: QuestionType.Multi
  distribution: { value: string; count: number; correct: boolean }[]
}

export type GameEventQuestionResultsSlider = {
  type: QuestionType.Slider
  distribution: { value: number; count: number; correct: boolean }[]
}

export type GameEventQuestionResultsTrueFalse = {
  type: QuestionType.TrueFalse
  distribution: { value: boolean; count: number; correct: boolean }[]
}

export type GameEventQuestionResultsTypeAnswer = {
  type: QuestionType.TypeAnswer
  distribution: { value: string; count: number; correct: boolean }[]
}

export type GameEventQuestionResults =
  | GameEventQuestionResultsMulti
  | GameEventQuestionResultsSlider
  | GameEventQuestionResultsTrueFalse
  | GameEventQuestionResultsTypeAnswer

export type GameResultHostEvent = {
  type: GameEventType.GameResultHost
  game: {
    pin: string
  }
  question: {
    type: QuestionType
    question: string
  }
  results: GameEventQuestionResults
  pagination: {
    current: number
    total: number
  }
}

export type GameResultPlayerEvent = {
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

export type GamePodiumHostEvent = {
  type: GameEventType.GamePodiumHost
  leaderboard: { position: number; nickname: string; score: number }[]
}

export type GamePodiumPlayerEvent = {
  type: GameEventType.GamePodiumPlayer
  title: string
  nickname: string
  position: number
  score: number
}

export type GameEvent =
  | GameLobbyHostEvent
  | GameLobbyPlayerEvent
  | GameGameBeginHostEvent
  | GameGameBeginPlayerEvent
  | GameQuestionPreviewHostEvent
  | GameQuestionPreviewPlayerEvent
  | GameQuestionHostEvent
  | GameQuestionPlayerEvent
  | GameAwaitingResultPlayerEvent
  | GameLeaderboardHostEvent
  | GameResultHostEvent
  | GameResultPlayerEvent
  | GamePodiumHostEvent
  | GamePodiumPlayerEvent
