import {
  CountdownEvent,
  GameAwaitingResultPlayerEvent,
  GameBeginHostEvent,
  GameBeginPlayerEvent,
  GameEvent,
  GameEventQuestion,
  GameEventQuestionResults,
  GameEventQuestionResultsRange,
  GameEventQuestionResultsTrueFalse,
  GameEventQuestionResultsTypeAnswer,
  GameEventType,
  GameLeaderboardHostEvent,
  GameLoadingEvent,
  GameLobbyHostEvent,
  GameLobbyPlayerEvent,
  GameParticipantType,
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
import { GameEventQuestionResultsMultiChoice } from '@quiz/common/dist/cjs/models/game-event'
import { GameLeaderboardPlayerEvent, GameQuitEvent } from '@quiz/common/src'

import {
  isMultiChoiceQuestion,
  isRangeQuestion,
  isTrueFalseQuestion,
  isTypeAnswerQuestion,
} from '../../../quiz/services/utils'
import {
  GameDocument,
  ParticipantBase,
  ParticipantPlayer,
  TaskType,
} from '../models/schemas'

import {
  isMultiChoiceAnswer,
  isRangeAnswer,
  isTrueFalseAnswer,
  isTypeAnswerAnswer,
} from './question-answer.utils'
import {
  isLeaderboardTask,
  isLobbyTask,
  isPodiumTask,
  isQuestionResultTask,
  isQuestionTask,
  isQuitTask,
} from './task.utils'

/**
 * Metadata associated with game events, used to track answer submissions and player-specific information.
 */
export interface GameEventMetaData {
  currentAnswerSubmissions: number
  totalAnswerSubmissions: number
  hasPlayerAnswerSubmission: boolean
}

/**
 * Constructs an event for the host based on the current state of the game document.
 *
 * @param {GameDocument} document - The `GameDocument` representing the current state of the game, including its task and associated data.
 * @param {Partial<GameEventMetaData>} metadata - Metadata including the number of submissions and related player information.
 *
 * @throws {Error} Throws an error if the task type is not recognized.
 *
 * @returns A `GameEvent` tailored for the host, depending on the type and status of the current task.
 */
export function buildHostGameEvent(
  document: GameDocument,
  metadata: Partial<GameEventMetaData> = {},
): GameEvent {
  if (isLobbyTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLobbyHostEvent(document)
      case 'completed':
        return buildGameBeginHostEvent()
    }
  }

  if (isQuestionTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameQuestionPreviewHostEvent(document)
      case 'active':
        return buildGameQuestionHostEvent(
          document,
          metadata.currentAnswerSubmissions ?? 0,
          metadata.totalAnswerSubmissions ?? 0,
        )
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

  if (isQuitTask(document)) {
    return buildGameQuitEvent()
  }

  throw new Error('Unknown task')
}

/**
 * Constructs an event for a player based on the current state of the game document and the provided player details.
 *
 * @param {GameDocument} document - The `GameDocument` representing the current state of the game, including its task and associated data.
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 * @param {Partial<GameEventMetaData>} metadata - Metadata containing the number of submissions and related player information.
 *
 * @throws {Error} Throws an error if the task type is not recognized.
 *
 * @returns A `GameEvent` tailored for the player, depending on the type and status of the current task.
 */
export function buildPlayerGameEvent(
  document: GameDocument,
  participantPlayer: ParticipantBase & ParticipantPlayer,
  metadata: Partial<GameEventMetaData> = {},
): GameEvent {
  if (isLobbyTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLobbyPlayerEvent(participantPlayer)
      case 'completed':
        return buildGameBeginPlayerEvent(participantPlayer)
    }
  }

  if (isQuestionTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameQuestionPreviewPlayerEvent(document, participantPlayer)
      case 'active':
        return metadata.hasPlayerAnswerSubmission
          ? buildGameAwaitingResultPlayerEvent(document, participantPlayer)
          : buildGameQuestionPlayerEvent(document, participantPlayer)
      case 'completed':
        return buildGameAwaitingResultPlayerEvent(document, participantPlayer)
    }
  }

  if (isQuestionResultTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameResultPlayerEvent(document, participantPlayer)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isLeaderboardTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGameLeaderboardPlayerEvent(document, participantPlayer)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isPodiumTask(document)) {
    switch (document.currentTask.status) {
      case 'pending':
        return buildGameLoadingEvent()
      case 'active':
        return buildGamePodiumPlayerEvent(document, participantPlayer)
      case 'completed':
        return buildGameLoadingEvent()
    }
  }

  if (isQuitTask(document)) {
    return buildGameQuitEvent()
  }

  throw new Error('Unknown task')
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
    players: document.participants
      .filter((participant) => participant.type === GameParticipantType.PLAYER)
      .map(({ player: { _id: id }, nickname }) => ({
        id,
        nickname,
      })),
  }
}

/**
 * Builds a lobby event for a player.
 *
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 *
 * @returns {GameLobbyPlayerEvent} A lobby event containing the player's nickname.
 */
function buildGameLobbyPlayerEvent(
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameLobbyPlayerEvent {
  const { nickname } = participantPlayer
  return {
    type: GameEventType.GameLobbyPlayer,
    player: { nickname },
  }
}

/**
 * Builds an event to signal the start of the game for the host.
 *
 * @returns {GameBeginHostEvent} An event indicating the game has started for the host.
 */
function buildGameBeginHostEvent(): GameBeginHostEvent {
  return { type: GameEventType.GameBeginHost }
}

/**
 * Builds an event to signal the start of the game for a player.
 *
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 *
 * @returns {GameBeginPlayerEvent} An event indicating the game has started for the player.
 */
function buildGameBeginPlayerEvent(
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameBeginPlayerEvent {
  const { nickname } = participantPlayer
  return {
    type: GameEventType.GameBeginPlayer,
    player: { nickname },
  }
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
  return {
    initiatedTime:
      document.currentTask.currentTransitionInitiated?.toISOString(),
    expiryTime: document.currentTask.currentTransitionExpires?.toISOString(),
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
  return {
    initiatedTime:
      document.currentTask.currentTransitionInitiated?.toISOString(),
    expiryTime: document.currentTask.currentTransitionExpires?.toISOString(),
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
  const { type, text: question } =
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
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 *
 * @returns {GameQuestionPreviewPlayerEvent} An event showing a preview of the current question for the player.
 */
function buildGameQuestionPreviewPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameQuestionPreviewPlayerEvent {
  const { type, text: question } =
    document.questions[document.currentTask.questionIndex]

  const { nickname, totalScore: score } = participantPlayer

  return {
    type: GameEventType.GameQuestionPreviewPlayer,
    player: {
      nickname,
      score,
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
    question: question.text,
    media: question.media
      ? { type: question.media.type, url: question.media.url }
      : null,
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
        step: question.step,
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
 * @param {number} currentAnswerSubmissions - The current count of answers submitted for the question.
 * @param {number} totalAnswerSubmissions - The total number of answers expected to be submitted for the question.
 *
 * @returns {GameQuestionHostEvent} A question event for the host.
 */
function buildGameQuestionHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  currentAnswerSubmissions: number,
  totalAnswerSubmissions: number,
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
      current: currentAnswerSubmissions,
      total: totalAnswerSubmissions,
    },
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Builds a question event for a player, including countdown and score details.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Question } }} document - The game document containing the current question task.
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 *
 * @returns {GameQuestionPlayerEvent} A question event for the player.
 */
function buildGameQuestionPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameQuestionPlayerEvent {
  const currentQuestion = document.questions[document.currentTask.questionIndex]

  const { nickname, totalScore: total } = participantPlayer

  return {
    type: GameEventType.GameQuestionPlayer,
    player: {
      nickname,
      score: {
        total,
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
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 *
 * @returns {GameAwaitingResultPlayerEvent} An event indicating the player is waiting for the question result.
 */
function buildGameAwaitingResultPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Question } },
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameAwaitingResultPlayerEvent {
  const { nickname, totalScore: total } = participantPlayer

  return {
    type: GameEventType.GameAwaitingResultPlayer,
    player: {
      nickname,
      score: {
        total,
      },
    },
    pagination: buildPaginationEvent(document),
  }
}

/**
 * Constructs the question results event based on the current question type and aggregates the answer distribution.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} document - The game document containing the current question result task.
 *
 * @returns {GameEventQuestionResults} An object representing the results of the question, including the answer distribution.
 *
 * @throws {Error} Throws an error if the question type is not recognized.
 */
function buildGameEventQuestionResults(
  document: GameDocument & { currentTask: { type: TaskType.QuestionResult } },
): GameEventQuestionResults {
  const question = document.questions[document.currentTask.questionIndex]

  if (isMultiChoiceQuestion(question)) {
    const type = question.type

    type Distribution = GameEventQuestionResultsMultiChoice['distribution']
    type DistributionItem = Distribution[number]

    const initial: DistributionItem[] = question.options
      .map(({ value, correct }, index) => ({
        value,
        count: 0,
        correct,
        index,
      }))
      .filter(({ correct }) => correct)

    const distribution: Distribution = document.currentTask.results.reduce(
      (prev, current) => {
        if (isMultiChoiceAnswer(current.answer)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const optionIndex = (current.answer as any).toObject().answer
          if (optionIndex >= 0 && optionIndex < question.options.length) {
            const optionsValue = question.options[optionIndex].value
            const index = prev.findIndex(({ value }) => value === optionsValue)
            if (index >= 0) {
              prev[index] = { ...prev[index], count: prev[index].count + 1 }
            } else {
              prev.push({
                value: optionsValue,
                count: 1,
                correct: current.correct,
                index: optionIndex,
              })
            }
          }
        }
        return prev
      },
      initial,
    )

    return { type, distribution }
  }

  if (isRangeQuestion(question)) {
    const type = question.type

    type Distribution = GameEventQuestionResultsRange['distribution']
    type DistributionItem = Distribution[number]

    const initial: DistributionItem[] = [
      { value: question.correct, count: 0, correct: true },
    ]

    const distribution: Distribution = document.currentTask.results.reduce(
      (prev, current) => {
        if (isRangeAnswer(current.answer)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const answer = (current.answer as any).toObject().answer
          const index = prev.findIndex(({ value }) => value === answer)
          if (index >= 0) {
            prev[index] = { ...prev[index], count: prev[index].count + 1 }
          } else {
            prev.push({
              value: answer,
              count: 1,
              correct: current.correct,
            })
          }
        }
        return prev
      },
      initial,
    )

    return { type, distribution }
  }

  if (isTrueFalseQuestion(question)) {
    const type = question.type

    type Distribution = GameEventQuestionResultsTrueFalse['distribution']
    type DistributionItem = Distribution[number]

    const initial: DistributionItem[] = [
      { value: question.correct, count: 0, correct: true },
    ]

    const distribution: Distribution = document.currentTask.results.reduce(
      (prev, current) => {
        if (isTrueFalseAnswer(current.answer)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const answer = (current.answer as any).toObject().answer
          const index = prev.findIndex(({ value }) => value === answer)
          if (index >= 0) {
            prev[index] = { ...prev[index], count: prev[index].count + 1 }
          } else {
            prev.push({
              value: answer,
              count: 1,
              correct: current.correct,
            })
          }
        }
        return prev
      },
      initial,
    )

    return { type, distribution }
  }

  if (isTypeAnswerQuestion(question)) {
    const type = question.type

    type Distribution = GameEventQuestionResultsTypeAnswer['distribution']
    type DistributionItem = Distribution[number]

    const initial: DistributionItem[] = question.options.map((option) => ({
      value: option,
      count: 0,
      correct: true,
    }))

    const distribution: Distribution = document.currentTask.results.reduce(
      (prev, current) => {
        if (isTypeAnswerAnswer(current.answer)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const answer = (current.answer as any).toObject().answer.toLowerCase()
          const index = prev.findIndex(
            ({ value }) => value.toLowerCase() === answer,
          )
          if (index >= 0) {
            prev[index] = { ...prev[index], count: prev[index].count + 1 }
          } else {
            prev.push({
              value: answer,
              count: 1,
              correct: current.correct,
            })
          }
        }
        return prev
      },
      initial,
    )

    return { type, distribution }
  }

  throw new Error('Question type is undefined or invalid.')
}

/**
 * Builds a question result event for the host.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} document - The game document containing the current question result task.
 */
function buildGameResultHostEvent(
  document: GameDocument & { currentTask: { type: TaskType.QuestionResult } },
): GameResultHostEvent {
  const { type, text: question } =
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
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 */
function buildGameResultPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.QuestionResult } },
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameResultPlayerEvent {
  const { nickname, player } = participantPlayer

  const resultsEntry = document.currentTask.results.find(
    ({ playerId }) => playerId === player._id,
  )

  if (!resultsEntry) {
    // TODO: throw exception here instead
    return {
      type: GameEventType.GameResultPlayer,
      player: {
        nickname,
        score: {
          correct: false,
          last: 0,
          total: participantPlayer.totalScore,
          position: document.participants.filter(
            ({ type }) => type === GameParticipantType.PLAYER,
          ).length,
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
      nickname,
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
 * Builds a leaderboard event for the player.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.Leaderboard } }} document - The game document containing the current leaderboard task.
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 */
function buildGameLeaderboardPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Leaderboard } },
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GameLeaderboardPlayerEvent {
  const { player, nickname } = participantPlayer

  const leaderboardEntry = document.currentTask.leaderboard.find(
    ({ playerId }) => playerId === player._id,
  )
  if (!leaderboardEntry) {
    throw new Error(`Player not found in leaderboard: ${player._id}`)
  }
  const { position, score, streaks } = leaderboardEntry

  return {
    type: GameEventType.GameLeaderboardPlayer,
    player: {
      nickname,
      score: {
        position,
        score,
        streaks,
      },
    },
    pagination: buildPaginationEvent(document),
  }
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
 * @param {ParticipantBase & ParticipantPlayer} participantPlayer - The player participant object for whom the event is being built.
 */
function buildGamePodiumPlayerEvent(
  document: GameDocument & { currentTask: { type: TaskType.Podium } },
  participantPlayer: ParticipantBase & ParticipantPlayer,
): GamePodiumPlayerEvent {
  const { player, nickname } = participantPlayer

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
      nickname,
      score: {
        total,
        position,
      },
    },
  }
}

/**
 * Builds a quit event for the game.
 *
 * @returns {GameLoadingEvent} A quit event for the game, indicating that the game is terminated.
 */
export function buildGameQuitEvent(): GameQuitEvent {
  return { type: GameEventType.GameQuitEvent }
}
