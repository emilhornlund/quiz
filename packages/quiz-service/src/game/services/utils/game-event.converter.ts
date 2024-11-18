import {
  CountdownEvent,
  GameAwaitingResultPlayerEvent,
  GameBeginHostEvent,
  GameBeginPlayerEvent,
  GameEvent,
  GameEventQuestion,
  GameEventQuestionResults,
  GameEventType,
  GameLeaderboardHostEvent,
  GameLoadingEvent,
  GameLobbyHostEvent,
  GameLobbyPlayerEvent,
  GamePodiumHostEvent,
  GamePodiumPlayerEvent,
  GameQuestionHostEvent,
  GameQuestionPlayerEvent,
  GameQuestionPreviewHostEvent,
  GameQuestionPreviewPlayerEvent,
  GameResultHostEvent,
  GameResultPlayerEvent,
  PaginationEvent,
  QuestionType,
} from '@quiz/common'

import { GameDocument, Player, TaskType } from '../models/schemas'

import {
  getQuestionTaskActiveDuration,
  getQuestionTaskPendingDuration,
} from './gameplay.utils'

/**
 * Constructs an event for the host based on the current state of the game document.
 *
 * @param {GameDocument} document - The `GameDocument` representing the current state of the game, including its task and associated data.
 *
 * @throws {Error} Throws an error if the task type is not recognized.
 *
 * @returns A `GameEvent` tailored for the host, depending on the type and status of the current task.
 */
export function buildHostGameEvent(document: GameDocument): GameEvent {
  if (isLobbyTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLobbyHostEvent(document)
      case 'completed':
        return buildGameBeginHostEvent(document)
    }
  }

  if (isQuestionTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameQuestionPreviewHostEvent(document)
      case 'active':
        return buildGameQuestionHostEvent(document)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isQuestionResultTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameResultHostEvent(document)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isLeaderboardTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLeaderboardHostEvent(document)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isPodiumTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGamePodiumHostEvent(document)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  throw new Error('Unknown task')
}

/**
 * Constructs an event for a player based on the current state of the game document and the provided player details.
 *
 * @param {GameDocument} document - The `GameDocument` representing the current state of the game, including its task and associated data.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @throws {Error} Throws an error if the task type is not recognized.
 *
 * @returns A `GameEvent` tailored for the player, depending on the type and status of the current task.
 */
export function buildPlayerGameEvent(
  document: GameDocument,
  player: Player,
): GameEvent {
  if (isLobbyTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLobbyPlayerEvent(document, player)
      case 'completed':
        return buildGameBeginPlayerEvent(document, player)
    }
  }

  if (isQuestionTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameQuestionPreviewPlayerEvent(document, player)
      case 'active':
        return document.currentTask.answers.find(
          ({ playerId }) => playerId === player._id,
        )
          ? buildGameAwaitingResultPlayerEvent(document, player)
          : buildGameQuestionPlayerEvent(document, player)
      case 'completed':
        return buildGameAwaitingResultPlayerEvent(document, player)
    }
  }

  if (isQuestionResultTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameResultPlayerEvent(document, player)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isLeaderboardTask(document)) {
    return buildGameLoadingEvent()
  }

  if (isPodiumTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGamePodiumPlayerEvent(document, player)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  throw new Error('Unknown task')
}

/**
 * Checks if the current task of the game document is a lobby task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Lobby } }} document - The game document with a lobby task type.
 *
 * @returns {boolean} Returns `true` if the current task type is `Lobby`, otherwise `false`.
 */
function isLobbyTask(
  document: GameDocument,
): document is GameDocument & { currentTask: { type: TaskType.Lobby } } {
  return document.currentTask.type === TaskType.Lobby
}

/**
 * Builds a loading event for the game.
 *
 * @returns {GameLoadingEvent} A loading event for the game, indicating that the game is in a loading state.
 */
function buildGameLoadingEvent(): GameLoadingEvent {
  return { type: GameEventType.GameLoading }
}

/**
 * Builds a lobby event for the host, including game and player details.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Lobby } }} document - The game document with a lobby task type.
 *
 * @returns {GameLobbyHostEvent} A lobby event containing game PIN and player list.
 */
function buildGameLobbyHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.Lobby } },
): GameLobbyHostEvent {
  return {
    type: GameEventType.GameLobbyHost,
    game: { id: document._id, pin: document.pin },
    players: document.players.map(({ nickname }) => ({ nickname })),
  }
}

/**
 * Builds a lobby event for a player.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Lobby } }} document - The game document with a lobby task type.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @returns {GameLobbyPlayerEvent} A lobby event containing the player's nickname.
 */
function buildGameLobbyPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Lobby } },
  player: Player,
): GameLobbyPlayerEvent {
  return {
    type: GameEventType.GameLobbyPlayer,
    player: { nickname: player.nickname },
  }
}

/**
 * Builds an event to signal the start of the game for the host.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Lobby } }} document - The game document with a lobby task type.
 *
 * @returns {GameBeginHostEvent} An event indicating the game has started for the host.
 */
function buildGameBeginHostEvent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  document: GameDocument & { currentTask: { type: TaskType.Lobby } },
): GameBeginHostEvent {
  return { type: GameEventType.GameBeginHost }
}

/**
 * Builds an event to signal the start of the game for a player.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Lobby } }} document - The game document with a lobby task type.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @returns {GameBeginPlayerEvent} An event indicating the game has started for the player.
 */
function buildGameBeginPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Lobby } },
  player: Player,
): GameBeginPlayerEvent {
  return {
    type: GameEventType.GameBeginPlayer,
    player: { nickname: player.nickname },
  }
}

/**
 * Checks if the current task of the game document is a question task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document with a question task type.
 *
 * @returns {boolean} Returns `true` if the current task type is `Question`, otherwise `false`.
 */
function isQuestionTask(
  document: GameDocument,
): document is GameDocument & { currentTask: { type: TaskType.Question } } {
  return document.currentTask.type === TaskType.Question
}

/**
 * Builds a countdown event for the current question preview event.
 *
 * @param {GameDocument} document - The game document containing the current question task.
 *
 * @returns {CountdownEvent} A countdown event with expiry time and server time.
 */
function buildGameQuestionPreviewCountdownEvent(
  document: GameDocument & {
    currentTask: { type: TaskType.Question }
  },
): CountdownEvent {
  const pendingDuration = Math.max(0, getQuestionTaskPendingDuration(document))

  return {
    expiryTime: new Date(Date.now() + pendingDuration).toISOString(),
    serverTime: new Date().toISOString(),
  }
}

/**
 * Builds a countdown event for the current question event.
 *
 * @param {GameDocument} document - The game document containing the current question task.
 *
 * @returns {CountdownEvent} A countdown event with expiry time and server time.
 */
function buildGameQuestionCountdownEvent(
  document: GameDocument & {
    currentTask: { type: TaskType.Question }
  },
): CountdownEvent {
  const activeDuration = Math.max(0, getQuestionTaskActiveDuration(document))

  return {
    expiryTime: new Date(Date.now() + activeDuration).toISOString(),
    serverTime: new Date().toISOString(),
  }
}

/**
 * Builds a pagination event for the current question task.
 *
 * @param {GameDocument & { currentTask: { questionIndex: number } }} document - The game document containing the current question index.
 *
 * @returns {PaginationEvent} A pagination event with current question index and total questions.
 */
function buildPaginationEvent(
  document: GameDocument & { currentTask: { questionIndex: number } },
): PaginationEvent {
  return {
    current: document.currentTask.questionIndex + 1,
    total: document.questions.length,
  }
}

/**
 * Builds a question preview event for the host.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document containing the current question task.
 *
 * @returns {GameQuestionPreviewHostEvent} An event showing a preview of the current question for the host.
 */
function buildGameQuestionPreviewHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
): GameQuestionPreviewHostEvent {
  const { type, question } =
    document.questions[document.currentTask.questionIndex]
  return {
    type: GameEventType.GameQuestionPreviewHost,
    game: {
      pin: document.pin,
    },
    question: {
      type,
      question,
    },
    countdown: buildGameQuestionPreviewCountdownEvent(document),
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Builds a question preview event for a player.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document containing the current question task.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @returns {GameQuestionPreviewPlayerEvent} An event showing a preview of the current question for the player.
 */
function buildGameQuestionPreviewPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  player: Player,
): GameQuestionPreviewPlayerEvent {
  const { type, question } =
    document.questions[document.currentTask.questionIndex]
  return {
    type: GameEventType.GameQuestionPreviewPlayer,
    player: {
      nickname: player.nickname,
      score: 0, //TODO: save the total player score
    },
    question: {
      type,
      question,
    },
    countdown: buildGameQuestionPreviewCountdownEvent(document),
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Builds a game event question object based on the question type.
 *
 * @param {GameDocument['questions'][number]} question - The question object from the game document.
 *
 * @returns {GameEventQuestion} A formatted question object depending on the question type.
 */
function buildGameEventQuestion(
  question: GameDocument['questions'][number],
): GameEventQuestion {
  const common = {
    question: question.question,
    imageURL: question.imageURL,
    duration: question.duration,
  }
  switch (question.type) {
    case QuestionType.MultiChoice:
      return {
        type: QuestionType.MultiChoice,
        answers: question.options.map(({ value }) => ({ value })),
        ...common,
      }
    case QuestionType.Range:
      return {
        type: QuestionType.Range,
        min: question.min,
        max: question.max,
        step: 1, //TODO: calculate this
        ...common,
      }
    case QuestionType.TrueFalse:
      return {
        type: QuestionType.TrueFalse,
        ...common,
      }
    case QuestionType.TypeAnswer:
      return {
        type: QuestionType.TypeAnswer,
        ...common,
      }
  }
}

/**
 * Builds a question event for the host, including countdown and submission details.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document containing the current question task.
 *
 * @returns {GameQuestionHostEvent} A question event for the host.
 */
function buildGameQuestionHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
): GameQuestionHostEvent {
  const currentQuestion = document.questions[document.currentTask.questionIndex]
  return {
    type: GameEventType.GameQuestionHost,
    game: {
      pin: document.pin,
    },
    question: buildGameEventQuestion(currentQuestion),
    countdown: buildGameQuestionCountdownEvent(document),
    submissions: {
      current: document.currentTask.answers.length,
      total: document.players.length,
    },
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Builds a question event for a player, including countdown and score details.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document containing the current question task.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @returns {GameQuestionPlayerEvent} A question event for the player.
 */
function buildGameQuestionPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  player: Player,
): GameQuestionPlayerEvent {
  const currentQuestion = document.questions[document.currentTask.questionIndex]
  return {
    type: GameEventType.GameQuestionPlayer,
    player: {
      nickname: player.nickname,
      score: {
        total: 0, //TODO: save the total player score
      },
    },
    question: buildGameEventQuestion(currentQuestion),
    countdown: buildGameQuestionCountdownEvent(document),
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Builds an event indicating the player is awaiting the result of the question.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document containing the current question task.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 *
 * @returns {GameAwaitingResultPlayerEvent} An event indicating the player is waiting for the question result.
 */
function buildGameAwaitingResultPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  player: Player,
): GameAwaitingResultPlayerEvent {
  return {
    type: GameEventType.GameAwaitingResultPlayer,
    player: {
      nickname: player.nickname,
      score: {
        total: 0, //TODO: save the total player score
      },
    },
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Checks if the current task of the game document is a question result task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} document - The game document with a question result task type.
 *
 * @returns {boolean} Returns `true` if the current task type is `QuestionResult`, otherwise `false`.
 */
function isQuestionResultTask(
  document: GameDocument,
): document is GameDocument & {
  currentTask: { type: TaskType.QuestionResult }
} {
  return document.currentTask.type === TaskType.QuestionResult
}

function buildGameEventQuestionResults(
  document: GameDocument & { currentTask: { type: TaskType.QuestionResult } },
): GameEventQuestionResults {
  const type = document.questions[document.currentTask.questionIndex].type

  const distribution =
    type === QuestionType.MultiChoice || type === QuestionType.TypeAnswer
      ? document.currentTask.results.reduce(
          (prev, current) => {
            if (current.answer.type === type) {
              const index = prev.findIndex(
                ({ value }) => value === current.answer.answer,
              )
              if (index >= 0) {
                prev[index] = { ...prev[index], count: prev[index].count + 1 }
              } else {
                prev.push({
                  value: current.answer.answer as string,
                  count: 1,
                  correct: current.correct,
                })
              }
            }
            return prev
          },
          [] as { value: string; count: number; correct: boolean }[],
        )
      : type === QuestionType.Range
        ? document.currentTask.results.reduce(
            (prev, current) => {
              if (current.answer.type === type) {
                const index = prev.findIndex(
                  ({ value }) => value === current.answer.answer,
                )
                if (index >= 0) {
                  prev[index] = { ...prev[index], count: prev[index].count + 1 }
                } else {
                  prev.push({
                    value: current.answer.answer as number,
                    count: 1,
                    correct: current.correct,
                  })
                }
              }
              return prev
            },
            [] as { value: number; count: number; correct: boolean }[],
          )
        : document.currentTask.results.reduce(
            (prev, current) => {
              if (current.answer.type === type) {
                const index = prev.findIndex(
                  ({ value }) => value === current.answer.answer,
                )
                if (index >= 0) {
                  prev[index] = { ...prev[index], count: prev[index].count + 1 }
                } else {
                  prev.push({
                    value: current.answer.answer as boolean,
                    count: 1,
                    correct: current.correct,
                  })
                }
              }
              return prev
            },
            [] as { value: boolean; count: number; correct: boolean }[],
          )

  return { type, distribution } as GameEventQuestionResults
}

/**
 * Builds a question result event for the host.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} document - The game document containing the current question result task.
 */
function buildGameResultHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.QuestionResult } },
): GameResultHostEvent {
  const { type, question } =
    document.questions[document.currentTask.questionIndex]
  return {
    type: GameEventType.GameResultHost,
    game: {
      pin: document.pin,
    },
    question: {
      type,
      question,
    },
    results: buildGameEventQuestionResults(document),
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Builds a question result event for the player.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} document - The game document containing the current question result task.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 */
function buildGameResultPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.QuestionResult } },
  player: Player,
): GameResultPlayerEvent {
  const resultsEntry = document.currentTask.results.find(
    ({ playerId }) => playerId === player._id,
  )

  if (!resultsEntry) {
    return {
      type: GameEventType.GameResultPlayer,
      player: {
        nickname: player.nickname,
        score: {
          correct: false,
          last: 0,
          total: player.totalScore,
          position: document.players.length,
          streak: 0,
        },
      },
      pagination: buildPaginationEvent(document),
    }
  }

  const {
    correct,
    lastScore: last,
    totalScore: total,
    position,
    streak,
  } = resultsEntry

  return {
    type: GameEventType.GameResultPlayer,
    player: {
      nickname: player.nickname,
      score: {
        correct,
        last,
        total,
        position,
        streak,
      },
    },
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Checks if the current task of the game document is a leaderboard task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Leaderboard } }} document - The game document with a leaderboard task type.
 *
 * @returns {boolean} Returns `true` if the current task type is `Leaderboard`, otherwise `false`.
 */
function isLeaderboardTask(document: GameDocument): document is GameDocument & {
  currentTask: { type: TaskType.Leaderboard }
} {
  return document.currentTask.type === TaskType.Leaderboard
}

/**
 * Builds a leaderboard event for the host.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Leaderboard } }} document - The game document containing the current leaderboard task.
 */
function buildGameLeaderboardHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.Leaderboard } },
): GameLeaderboardHostEvent {
  return {
    type: GameEventType.GameLeaderboardHost,
    game: {
      pin: document.pin,
    },
    leaderboard: document.currentTask.leaderboard.map(
      ({ position, nickname, score, streaks }) => ({
        position,
        nickname,
        score,
        streaks,
      }),
    ),
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Checks if the current task of the game document is a podium task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Podium } }} document - The game document with a podium task type.
 *
 * @returns {boolean} Returns `true` if the current task type is `Podium`, otherwise `false`.
 */
function isPodiumTask(document: GameDocument): document is GameDocument & {
  currentTask: { type: TaskType.Podium }
} {
  return document.currentTask.type === TaskType.Podium
}

/**
 * Builds a podium event for the host.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Podium } }} document - The game document containing the current podium task.
 */
function buildGamePodiumHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.Podium } },
): GamePodiumHostEvent {
  return {
    type: GameEventType.GamePodiumHost,
    leaderboard: document.currentTask.leaderboard.map(
      ({ position, nickname, score }) => ({
        position,
        nickname,
        score,
      }),
    ),
  }
}

/**
 * Builds a podium event for the player.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Podium } }} document - The game document containing the current podium task.
 * @param {Player} player - The `Player` object representing the participant for whom the event is being built.
 */
function buildGamePodiumPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Podium } },
  player: Player,
): GamePodiumPlayerEvent {
  const leaderboardEntry = document.currentTask.leaderboard.find(
    ({ playerId }) => playerId === player._id,
  )
  if (!leaderboardEntry) {
    throw new Error(`Player not found in leaderboard: ${player._id}`)
  }
  const { score: total, position } = leaderboardEntry

  return {
    type: GameEventType.GamePodiumPlayer,
    game: {
      name: document.name,
    },
    player: {
      nickname: player.nickname,
      score: {
        total,
        position,
      },
    },
  }
}
