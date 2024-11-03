import { GameEventType } from './game-event-type.enum'
import { QuestionType } from './question-type.enum'

export type GameHeartbeatEvent = {
  type: GameEventType.GameHeartbeat
}

export type GameLobbyHostEvent = {
  type: GameEventType.GameLobbyHost
  game: {
    id: string
    pin: string
  }
  players: { nickname: string }[]
}

export type GameLobbyPlayerEvent = {
  type: GameEventType.GameLobbyPlayer
  player: {
    nickname: string
  }
}

export type GameGameBeginHostEvent = {
  type: GameEventType.GameBeginHost
}

export type GameGameBeginPlayerEvent = {
  type: GameEventType.GameBeginPlayer
  player: {
    nickname: string
  }
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

export type GameEventQuestionRange = {
  type: QuestionType.Range
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
  | GameEventQuestionRange
  | GameEventQuestionTrueFalse
  | GameEventQuestionTypeAnswer

export type GameQuestionHostEvent = {
  type: GameEventType.GameQuestionHost
  game: {
    pin: string
  }
  question: GameEventQuestion
  progress: {
    value: number
  }
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
  player: {
    nickname: string
    score: {
      total: number
    }
  }
  question: GameEventQuestion
  progress: {
    value: number
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameAwaitingResultPlayerEvent = {
  type: GameEventType.GameAwaitingResultPlayer
  player: {
    nickname: string
    score: {
      total: number
    }
  }
  pagination: {
    current: number
    total: number
  }
}

export type GameLeaderboardHostEvent = {
  type: GameEventType.GameLeaderboardHost
  game: {
    pin: string
  }
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

export type GameEventQuestionResultsRange = {
  type: QuestionType.Range
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
  | GameEventQuestionResultsRange
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
  player: {
    nickname: string
    score: {
      correct: boolean
      last: number
      total: number
      position: number
      streak: number
    }
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
  game: {
    name: string
  }
  player: {
    nickname: string
    score: {
      total: number
      position: number
    }
  }
}

export type GameEvent =
  | GameHeartbeatEvent
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
