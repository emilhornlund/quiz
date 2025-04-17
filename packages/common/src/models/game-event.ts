import { GameEventType } from './game-event-type.enum'
import { MediaType } from './media-type.enum'
import { QuestionType } from './question-type.enum'

export type CountdownEvent = {
  initiatedTime: string
  expiryTime: string
  serverTime: string
}

export type PaginationEvent = {
  current: number
  total: number
}

export type QuestionMediaEvent = {
  type: MediaType
  url: string
}

export type GameHeartbeatEvent = {
  type: GameEventType.GameHeartbeat
}

export type GameLoadingEvent = {
  type: GameEventType.GameLoading
}

export type GameLobbyHostEvent = {
  type: GameEventType.GameLobbyHost
  game: {
    id: string
    pin: string
  }
  players: {
    id: string
    nickname: string
  }[]
}

export type GameLobbyPlayerEvent = {
  type: GameEventType.GameLobbyPlayer
  player: {
    nickname: string
  }
}

export type GameBeginHostEvent = {
  type: GameEventType.GameBeginHost
}

export type GameBeginPlayerEvent = {
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
  countdown: CountdownEvent
  pagination: PaginationEvent
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
  countdown: CountdownEvent
  pagination: PaginationEvent
}

export type GameEventQuestionMultiChoice = {
  type: QuestionType.MultiChoice
  question: string
  media?: QuestionMediaEvent
  answers: { value: string }[]
  duration: number
}

export type GameEventQuestionRange = {
  type: QuestionType.Range
  question: string
  media?: QuestionMediaEvent
  min: number
  max: number
  step: number
  duration: number
}

export type GameEventQuestionTrueFalse = {
  type: QuestionType.TrueFalse
  question: string
  media?: QuestionMediaEvent
  duration: number
}

export type GameEventQuestionTypeAnswer = {
  type: QuestionType.TypeAnswer
  question: string
  media?: QuestionMediaEvent
  duration: number
}

export type GameEventQuestion =
  | GameEventQuestionMultiChoice
  | GameEventQuestionRange
  | GameEventQuestionTrueFalse
  | GameEventQuestionTypeAnswer

export type GameQuestionHostEvent = {
  type: GameEventType.GameQuestionHost
  game: {
    pin: string
  }
  question: GameEventQuestion
  countdown: CountdownEvent
  submissions: {
    current: number
    total: number
  }
  pagination: PaginationEvent
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
  countdown: CountdownEvent
  pagination: PaginationEvent
}

export type GameAwaitingResultPlayerEvent = {
  type: GameEventType.GameAwaitingResultPlayer
  player: {
    nickname: string
    score: {
      total: number
    }
  }
  pagination: PaginationEvent
}

export type GameEventQuestionResultsMultiChoice = {
  type: QuestionType.MultiChoice
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
  | GameEventQuestionResultsMultiChoice
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
  pagination: PaginationEvent
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
  pagination: PaginationEvent
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
  pagination: PaginationEvent
}

export type GameLeaderboardPlayerEvent = {
  type: GameEventType.GameLeaderboardPlayer
  player: {
    nickname: string
    score: {
      position: number
      score: number
      streaks: number
    }
  }
  pagination: PaginationEvent
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

export type GameQuitEvent = {
  type: GameEventType.GameQuitEvent
}

export type GameEvent =
  | GameHeartbeatEvent
  | GameLoadingEvent
  | GameLobbyHostEvent
  | GameLobbyPlayerEvent
  | GameBeginHostEvent
  | GameBeginPlayerEvent
  | GameQuestionPreviewHostEvent
  | GameQuestionPreviewPlayerEvent
  | GameQuestionHostEvent
  | GameQuestionPlayerEvent
  | GameAwaitingResultPlayerEvent
  | GameResultHostEvent
  | GameResultPlayerEvent
  | GameLeaderboardHostEvent
  | GameLeaderboardPlayerEvent
  | GamePodiumHostEvent
  | GamePodiumPlayerEvent
  | GameQuitEvent
