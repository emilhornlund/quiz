import {
  GameMode,
  GameParticipantType,
  QuestionType,
  shuffleDifferent,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { QuestionDao } from '../../../quiz/repositories/models/schemas'
import {
  isMultiChoiceQuestion,
  isPinQuestion,
  isPuzzleQuestion,
  isRangeQuestion,
  isTrueFalseQuestion,
  isTypeAnswerQuestion,
} from '../../../quiz/services/utils'
import { IllegalTaskTypeException } from '../../exceptions'
import {
  BaseTask,
  GameDocument,
  LeaderboardTask,
  LeaderboardTaskItem,
  LobbyTask,
  Participant,
  ParticipantBase,
  ParticipantPlayer,
  PodiumTask,
  QuestionResultTask,
  QuestionResultTaskCorrectAnswer,
  QuestionResultTaskItem,
  QuestionTask,
  QuestionTaskAnswer,
  QuestionTaskMetadata,
  QuitTask,
  TaskType,
} from '../../repositories/models/schemas'

import {
  calculateQuestionScoreForParticipant,
  isQuestionAnswerCorrect,
} from './scoring'
import { isQuestionResultTask, isQuestionTask } from './task.utils'

/**
 * Constructs a new lobby task with a unique ID, setting its initial status and creation timestamp.
 *
 * @returns {BaseTask & LobbyTask} A new lobby task object.
 */
export function buildLobbyTask(): BaseTask & LobbyTask {
  return {
    _id: uuidv4(),
    type: TaskType.Lobby,
    status: 'pending',
    created: new Date(),
  }
}

/**
 * Constructs new a metadata object for a new question task based on the provided question.
 *
 * @param question - The next question.
 *
 * @returns A new question metadata object.
 */
export function buildQuestionTaskMetadata(
  question: QuestionDao,
): QuestionTaskMetadata {
  if (isMultiChoiceQuestion(question)) {
    return { type: QuestionType.MultiChoice }
  }
  if (isRangeQuestion(question)) {
    return { type: QuestionType.Range }
  }
  if (isTrueFalseQuestion(question)) {
    return { type: QuestionType.TrueFalse }
  }
  if (isTypeAnswerQuestion(question)) {
    return { type: QuestionType.TypeAnswer }
  }
  if (isPinQuestion(question)) {
    return { type: QuestionType.Pin }
  }
  if (isPuzzleQuestion(question)) {
    const randomizedValues = shuffleDifferent(question.values)
    return { type: QuestionType.Puzzle, randomizedValues }
  }
}

/**
 * Constructs a new question task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @returns {BaseTask & QuestionTask} A new question task object.
 */
export function buildQuestionTask(
  gameDocument: GameDocument,
): BaseTask & QuestionTask {
  return {
    _id: uuidv4(),
    type: TaskType.Question,
    status: 'pending',
    metadata: buildQuestionTaskMetadata(
      gameDocument.questions[gameDocument.nextQuestion],
    ),
    questionIndex: gameDocument.nextQuestion,
    answers: [],
    created: new Date(),
  }
}

/**
 * Builds the initial set of “correct answer” payloads for a question,
 * normalized into the scoring/validation shape.
 *
 * - MultiChoice: one entry per correct option.
 * - Range: a single numeric value.
 * - True/False: a single boolean value.
 * - TypeAnswer: one entry per valid string option.
 * - Pin: a single `"x,y"` value from the question’s correct coordinates.
 * - Puzzle: the target ordering array from the question.
 *
 * @param gameDocument - The game document to extract correct answers from.
 * @returns An array of normalized correct-answer entries.
 */
function buildInitialQuestionResultTaskCorrectAnswers(
  gameDocument: GameDocument & { currentTask: { type: TaskType.Question } },
): QuestionResultTaskCorrectAnswer[] {
  const { questionIndex } = gameDocument.currentTask
  const question = gameDocument.questions[questionIndex]

  if (isMultiChoiceQuestion(question)) {
    return question.options
      .map((option, index) =>
        option.correct ? { type: QuestionType.MultiChoice, index } : undefined,
      )
      .filter((option) => !!option)
  }
  if (isRangeQuestion(question)) {
    return [{ type: QuestionType.Range, value: question.correct }]
  }
  if (isTrueFalseQuestion(question)) {
    return [{ type: QuestionType.TrueFalse, value: question.correct }]
  }
  if (isTypeAnswerQuestion(question)) {
    return question.options.map((option) => ({
      type: QuestionType.TypeAnswer,
      value: option,
    }))
  }
  if (isPinQuestion(question)) {
    return [
      {
        type: QuestionType.Pin,
        value: `${question.positionX},${question.positionY}`,
      },
    ]
  }
  if (isPuzzleQuestion(question)) {
    return [{ type: QuestionType.Puzzle, value: question.values }]
  }

  return []
}

/**
 * Constructs a new `QuestionResultTask` based on the current active question task.
 *
 * This function is typically used during normal gameplay after a question is completed.
 * It evaluates all player answers, calculates scores and correctness, and assigns positions.
 * The task includes the correct answers and is ready to be emitted or persisted.
 *
 * @param gameDocument - The current game state containing the active question task and answers.
 * @returns A fully populated `QuestionResultTask` with correct answers and scored results.
 *
 * @throws {IllegalTaskTypeException} If the current task is not of type `Question`.
 */
export function buildQuestionResultTask(
  gameDocument: GameDocument,
): BaseTask & QuestionResultTask {
  if (!isQuestionTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }

  const { mode, questions, participants } = gameDocument
  const { questionIndex, presented, answers } = gameDocument.currentTask
  const question = questions[questionIndex]

  const correctAnswers =
    buildInitialQuestionResultTaskCorrectAnswers(gameDocument)

  const results = buildQuestionResultTaskResults({
    mode,
    participants,
    question,
    presented,
    correctAnswers,
    answers,
  })

  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex,
    correctAnswers,
    results,
    created: new Date(),
  }
}

/**
 * Recomputes the `results` of an existing `QuestionResultTask` using data from the preceding `Question` task.
 *
 * This function is useful when needing to restore or recalculate results from a previously created result task.
 * It uses the preserved correct answers and answers from the previous task to regenerate the final result items.
 *
 * @param gameDocument - The game document where the current task is of type `QuestionResult`
 *                       and the previous task is of type `Question`.
 * @returns A `QuestionResultTask` with newly rebuilt results while preserving task metadata.
 *
 * @throws {IllegalTaskTypeException} If the current task is not a `QuestionResult` or the previous task is not a `Question`.
 */
export function rebuildQuestionResultTask(
  gameDocument: GameDocument,
): BaseTask & QuestionResultTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  const { mode, questions, participants } = gameDocument

  const previousTask =
    gameDocument.previousTasks?.[gameDocument.previousTasks.length - 1]
  if (previousTask?.type !== TaskType.Question) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Question,
    )
  }

  const { questionIndex, presented, answers } = previousTask
  const question = questions[questionIndex]

  const { correctAnswers } = gameDocument.currentTask

  const results = buildQuestionResultTaskResults({
    mode,
    participants,
    question,
    presented,
    correctAnswers,
    answers,
  })

  return {
    ...gameDocument.currentTask,
    results,
  }
}

/**
 * Builds and ranks the result items for each player in a question round.
 *
 * This function filters out player participants, retrieves their answers,
 * evaluates correctness, computes scores, and assigns positional rankings.
 *
 * @param mode - The game mode (`Classic` or `ZeroToOneHundred`), which determines the scoring strategy.
 * @param participants - All game participants; only players are included in the result.
 * @param question - The current question being evaluated.
 * @param presented - The timestamp when the question was shown.
 * @param correctAnswers - The list of correct answers for the question.
 * @param answers - All submitted player answers for the question.
 * @returns A sorted list of `QuestionResultTaskItem`s with calculated scores and positions.
 */
function buildQuestionResultTaskResults({
  mode,
  participants,
  question,
  presented,
  correctAnswers,
  answers,
}: {
  mode: GameMode
  participants: Participant[]
  question: QuestionDao
  presented: Date
  correctAnswers: QuestionResultTaskCorrectAnswer[]
  answers: QuestionTaskAnswer[]
}): QuestionResultTaskItem[] {
  return participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .map((participant) => {
      const answer = answers.find(
        ({ playerId }) => playerId === participant.participantId,
      )
      return buildQuestionResultTaskItem(
        mode,
        presented,
        participant,
        question,
        correctAnswers,
        answer,
      )
    })
    .sort((a, b) =>
      mode === GameMode.Classic
        ? compareSortClassicModeQuestionResultTaskItemByScore(a, b)
        : compareZeroToOneHundredModeQuestionResultTaskItemByScore(a, b),
    )
    .map((item, index) => ({ ...item, position: index + 1 }))
}

/**
 * Builds a `QuestionResultTaskItem` for a given player and their answer.
 *
 * Evaluates correctness, calculates scores, and includes player-specific stats.
 *
 * @param mode - The game mode (`Classic` or `ZeroToOneHundred`), which determines the scoring strategy.
 * @param presented - The timestamp when the question was presented.
 * @param participantPlayer - The player participant for whom the result is being calculated.
 * @param question - The question associated with the current task.
 * @param correctAnswers - The list of correct answers for the question.
 * @param answer - The answer provided by the player to the current question.
 * @returns A `QuestionResultTaskItem` containing the player's performance on the question.
 */
function buildQuestionResultTaskItem(
  mode: GameMode,
  presented: Date,
  participantPlayer: ParticipantBase & ParticipantPlayer,
  question: QuestionDao,
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer: QuestionTaskAnswer,
): QuestionResultTaskItem {
  const {
    participantId,
    nickname,
    totalScore: previousScore,
    currentStreak,
  } = participantPlayer

  const { type } = question

  const nextScore = calculateQuestionScoreForParticipant(
    mode,
    presented,
    question,
    correctAnswers,
    answer,
  )

  const correct = isQuestionAnswerCorrect(
    mode,
    question,
    correctAnswers,
    answer,
  )

  const totalScore = previousScore + nextScore

  const streak = correct ? currentStreak + 1 : 0

  return {
    type,
    playerId: participantId,
    nickname,
    answer,
    correct,
    lastScore: nextScore,
    totalScore,
    position: 0,
    streak,
  }
}

/**
 * Compares two scores in Classic mode for sorting in descending order.
 *
 * @param {number} lhs - The left-hand score.
 * @param {number} rhs - The right-hand score.
 *
 * @returns {number} A positive value if `lhs` is less than `rhs`, a negative value if greater, or 0 if they are equal.
 */
function compareSortClassicModeScores(lhs: number, rhs: number): number {
  if (lhs < rhs) {
    return 1
  }
  if (lhs > rhs) {
    return -1
  }
  return 0
}

/**
 * Compares two question result task items by their total scores in Classic mode.
 *
 * @param {QuestionResultTaskItem} lhs - The first question result task item to compare.
 * @param {QuestionResultTaskItem} rhs - The second question result task item to compare.
 *
 * @returns {number} A positive value if `lhs` has a lower score, a negative value if higher, or 0 if they are equal.
 */
function compareSortClassicModeQuestionResultTaskItemByScore(
  lhs: QuestionResultTaskItem,
  rhs: QuestionResultTaskItem,
): number {
  return compareSortClassicModeScores(lhs.totalScore, rhs.totalScore)
}

/**
 * Compares two players by their total scores in Classic mode.
 *
 * @param {ParticipantBase & ParticipantPlayer} lhs - The first player participant to compare.
 * @param {ParticipantBase & ParticipantPlayer} rhs - The second player participant to compare.
 *
 * @returns {number} A positive value if `lhs` has a lower score, a negative value if higher, or 0 if they are equal.
 */
function compareSortClassicModePlayersByScore(
  lhs: ParticipantBase & ParticipantPlayer,
  rhs: ParticipantBase & ParticipantPlayer,
): number {
  return compareSortClassicModeScores(lhs.totalScore, rhs.totalScore)
}

/**
 * Compares two question result task items by their total scores in ZeroToOneHundred mode.
 *
 * @param {QuestionResultTaskItem} lhs - The first question result task item to compare.
 * @param {QuestionResultTaskItem} rhs - The second question result task item to compare.
 *
 * @returns {number} A positive value if `lhs` has a higher score, a negative value if lower, or 0 if they are equal.
 *
 * @remarks
 * This reverses the sort order compared to Classic mode, sorting from lowest to highest.
 */
function compareZeroToOneHundredModeQuestionResultTaskItemByScore(
  lhs: QuestionResultTaskItem,
  rhs: QuestionResultTaskItem,
): number {
  return compareSortClassicModeQuestionResultTaskItemByScore(lhs, rhs) * -1 //sort scores from lowest to highest
}

/**
 * Compares two players by their total scores in ZeroToOneHundred mode.
 *
 * @param {ParticipantBase & ParticipantPlayer} lhs - The first player participant to compare.
 * @param {ParticipantBase & ParticipantPlayer} rhs - The second player participant to compare.
 *
 * @returns {number} A positive value if `lhs` has a higher score, a negative value if lower, or 0 if they are equal.
 *
 * @remarks
 * This reverses the sort order compared to Classic mode, sorting from lowest to highest.
 */
function compareZeroToOneHundredModePlayersByScore(
  lhs: ParticipantBase & ParticipantPlayer,
  rhs: ParticipantBase & ParticipantPlayer,
): number {
  return compareSortClassicModePlayersByScore(lhs, rhs) * -1 //sort scores from lowest to highest
}

/**
 * Builds leaderboard items for the current game document, sorting players by score based on the game mode.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @returns {LeaderboardTaskItem[]} An array of leaderboard task items.
 */
function buildLeaderboardItems(
  gameDocument: GameDocument,
): LeaderboardTaskItem[] {
  return gameDocument.participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .sort((a, b) =>
      gameDocument.mode === GameMode.Classic
        ? compareSortClassicModePlayersByScore(a, b)
        : compareZeroToOneHundredModePlayersByScore(a, b),
    )
    .map(
      (
        { participantId, nickname, totalScore: score, currentStreak: streaks },
        index,
      ) => ({
        playerId: participantId,
        nickname,
        position: index + 1,
        score,
        streaks,
      }),
    )
}

/**
 * Updates the total score and current streak of each player based on the results from the current question task.
 *
 * @param {GameDocument & { currentTask: { type: TaskType.QuestionResult } }} gameDocument - The game document containing the current question result task and player data.
 *
 * @returns {void} This function does not return a value; it modifies the `gameDocument` in place.
 */
function applyLastScore(
  gameDocument: GameDocument & {
    currentTask: { type: TaskType.QuestionResult }
  },
): void {
  gameDocument.participants
    .filter((participant) => participant.type === GameParticipantType.PLAYER)
    .forEach((participant) => {
      const resultEntry = gameDocument.currentTask.results.find(
        ({ playerId }) => playerId === participant.participantId,
      )
      if (resultEntry) {
        participant.rank = resultEntry.position
        participant.totalScore = resultEntry.totalScore
        participant.currentStreak = resultEntry.streak
      }
    })
}

/**
 * Constructs a new leaderboard task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns {BaseTask & LeaderboardTask} A new leaderboard task object.
 */
export function buildLeaderboardTask(
  gameDocument: GameDocument,
): BaseTask & LeaderboardTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  applyLastScore(gameDocument)

  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: gameDocument.nextQuestion - 1,
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}

/**
 * Constructs a new podium task based on the provided game document.
 *
 * @param {GameDocument} gameDocument - The current game document.
 *
 * @throws {IllegalTaskTypeException} If the current task type is not a question result.
 *
 * @returns {BaseTask & PodiumTask} A new podium task object.
 */
export function buildPodiumTask(
  gameDocument: GameDocument,
): BaseTask & PodiumTask {
  if (!isQuestionResultTask(gameDocument)) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.QuestionResult,
    )
  }

  applyLastScore(gameDocument)

  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard: buildLeaderboardItems(gameDocument),
    created: new Date(),
  }
}

/**
 * Constructs a new quit task, setting its initial status and creation timestamp.
 *
 * @returns {BaseTask & QuitTask} A new quit task object.
 */
export function buildQuitTask(): BaseTask & QuitTask {
  return {
    _id: uuidv4(),
    type: TaskType.Quit,
    status: 'completed',
    created: new Date(),
  }
}
