import { GameEventType } from './game-event-type.enum'
import { GameMode } from './game-mode.enum'
import { GameStatus } from './game-status.enum'
import { MediaType } from './media-type.enum'
import { QuestionImageRevealEffectType } from './question-image-reveal-effect-type.enum'
import { QuestionPinTolerance } from './question-pin-tolerance.enum'
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

export type QuestionMediaEvent =
  | {
      type: MediaType.Image
      url: string
      effect?: QuestionImageRevealEffectType
    }
  | {
      type: MediaType.Audio
      url: string
    }
  | {
      type: MediaType.Video
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
    mode: GameMode
    pin: string
  }
  question: {
    type: QuestionType
    question: string
    points?: number
  }
  countdown: CountdownEvent
  pagination: PaginationEvent
}

export type GameQuestionPreviewPlayerEvent = {
  type: GameEventType.GameQuestionPreviewPlayer
  game: {
    mode: GameMode
  }
  player: {
    nickname: string
    score: number
  }
  question: {
    type: QuestionType
    question: string
    points?: number
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

export type GameEventQuestionPin = {
  readonly type: QuestionType.Pin
  readonly question: string
  readonly imageURL: string
  readonly duration: number
}

export type GameEventQuestionPuzzle = {
  readonly type: QuestionType.Puzzle
  readonly question: string
  readonly media?: QuestionMediaEvent
  readonly values: string[]
  readonly duration: number
}

export type GameEventQuestion =
  | GameEventQuestionMultiChoice
  | GameEventQuestionRange
  | GameEventQuestionTrueFalse
  | GameEventQuestionTypeAnswer
  | GameEventQuestionPin
  | GameEventQuestionPuzzle

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
  distribution: {
    index: number
    value: string
    count: number
    correct: boolean
  }[]
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

export type GameEventQuestionResultsPin = {
  /**
   * The type of the question result, set to `Pin`.
   */
  readonly type: QuestionType.Pin

  /**
   * Public URL of the background image on which the player places the pin.
   */
  readonly imageURL: string

  /**
   * Correct X coordinate for the pin, normalized to the image width.
   * Range: 0 (left) … 1 (right).
   */
  readonly positionX: number

  /**
   * Correct Y coordinate for the pin, normalized to the image height.
   * Range: 0 (top) … 1 (bottom).
   */
  readonly positionY: number

  /**
   * Allowed distance preset around the correct spot that counts as correct.
   * Higher tolerance values accept pins farther from the exact position.
   */
  readonly tolerance: QuestionPinTolerance
  readonly distribution: {
    readonly value: string
    readonly count: number
    readonly correct: boolean
  }[]
}

export type GameEventQuestionResultsPuzzle = {
  readonly type: QuestionType.Puzzle
  readonly values: string[]
  readonly distribution: {
    readonly value: string[]
    readonly count: number
    readonly correct: boolean
  }[]
}

export type GameEventQuestionResults =
  | GameEventQuestionResultsMultiChoice
  | GameEventQuestionResultsRange
  | GameEventQuestionResultsTrueFalse
  | GameEventQuestionResultsTypeAnswer
  | GameEventQuestionResultsPin
  | GameEventQuestionResultsPuzzle

export type GameResultHostEvent = {
  type: GameEventType.GameResultHost
  game: {
    pin: string
  }
  question: {
    type: QuestionType
    question: string
    media?: QuestionMediaEvent
    info?: string
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
    behind?: {
      points: number
      nickname: string
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
    behind?: {
      points: number
      nickname: string
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
  status: GameStatus
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
