import {
  calculateRangeBounds,
  GameMode,
  GameParticipantType,
  QUESTION_PIN_TOLERANCE_RADIUS,
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { shuffleDifferent } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionPinDao,
  QuestionRangeDao,
} from '../../../quiz/repositories/models/schemas'
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
  QuestionTaskBaseAnswer,
  QuestionTaskMetadata,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskPinAnswer,
  QuestionTaskPuzzleAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  QuitTask,
  TaskType,
} from '../../repositories/models/schemas'

import {
  isMultiChoiceAnswer,
  isMultiChoiceCorrectAnswer,
  isPinAnswer,
  isPinCorrectAnswer,
  isPuzzleAnswer,
  isPuzzleCorrectAnswer,
  isRangeAnswer,
  isRangeCorrectAnswer,
  isTrueFalseAnswer,
  isTrueFalseCorrectAnswer,
  isTypeAnswerAnswer,
  isTypeAnswerCorrectAnswer,
} from './question-answer.utils'
import {
  calculateClassicModeRawScore,
  calculatePuzzleScore,
  isPuzzleQuestionAnswerCorrect,
} from './scoring-strategies.utils'
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
 * Parses a `"x,y"` string into a normalized pin position.
 *
 * - Returns `{ x: 0, y: 0 }` if the input is falsy or not in `"x,y"` form.
 * - Does not clamp or validate ranges; callers may enforce 0..1 if required.
 * - If the numeric parts are not parseable, `x`/`y` will be `NaN`.
 *
 * @param value - A string in the form `"x,y"` where both are decimal numbers.
 * @returns An object with `x` and `y` numeric coordinates.
 */
export function toPinPositionFromString(value?: string): {
  x: number
  y: number
} {
  if (!value) return { x: 0, y: 0 }

  const split = value.split(',')

  if (split.length !== 2) return { x: 0, y: 0 }

  const x = Number(split[0])
  const y = Number(split[1])
  return { x, y }
}

/**
 * Computes the Euclidean distance between two normalized positions.
 *
 * - Inputs are expected (but not enforced) to be normalized to the image
 *   size (0..1 per axis). The theoretical max distance is √2.
 * - The result is rounded to 2 decimals to align with tolerance checks.
 *
 * @param a - First point `{ x, y }`.
 * @param b - Second point `{ x, y }`.
 * @returns The Euclidean distance rounded to 2 decimals.
 */
export function calculateDistanceNorm(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const d = Math.hypot(dx, dy) // normalized (since inputs are 0..1)
  return Math.round((d + Number.EPSILON) * 100) / 100
}

/**
 * Determines if a player's answer is correct based on the provided correct answers.
 *
 * Handles all supported question types:
 * - MultiChoice: Matches selected option index against correct indices.
 * - Range: Compares numeric value with margin consideration.
 * - TrueFalse: Matches boolean value.
 * - TypeAnswer: Compares lowercase trimmed string values.
 *
 * @param correctAnswers - An array of correct answers for the current question.
 * @param answer - The player's submitted answer.
 * @param rangeData - description here (optional)
 * @param tolerance - Optional allowed distance preset for Pin questions.
 * @returns `true` if the answer is correct; otherwise `false`.
 */
export function isQuestionAnswerCorrect(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer?: QuestionTaskAnswer,
  rangeData?: {
    margin: QuestionRangeAnswerMargin
    min: number
    max: number
    step: number
  },
  tolerance?: QuestionPinTolerance,
): boolean {
  if (isMultiChoiceAnswer(answer)) {
    return correctAnswers
      .filter(isMultiChoiceCorrectAnswer)
      .some((correctAnswer) => correctAnswer.index === answer.answer)
  }

  if (isRangeAnswer(answer) && rangeData) {
    return correctAnswers.filter(isRangeCorrectAnswer).some(({ value }) => {
      const { margin, min, max, step } = rangeData
      if (margin === QuestionRangeAnswerMargin.None) {
        return value === answer.answer
      }
      const { lower, upper } = calculateRangeBounds(
        margin,
        value,
        min,
        max,
        step,
      )
      return answer.answer >= lower && answer.answer <= upper
    })
  }

  if (isTrueFalseAnswer(answer)) {
    return correctAnswers
      .filter(isTrueFalseCorrectAnswer)
      .some(({ value }) => value === answer.answer)
  }

  if (isTypeAnswerAnswer(answer)) {
    return correctAnswers
      .filter(isTypeAnswerCorrectAnswer)
      .some(
        ({ value }) =>
          !!value &&
          !!answer?.answer &&
          value.toLowerCase() === answer.answer.trim().toLowerCase(),
      )
  }

  if (isPinAnswer(answer)) {
    return correctAnswers.filter(isPinCorrectAnswer).some(({ value }) => {
      if (!value || !answer?.answer) return false

      const correctPosition = toPinPositionFromString(value)
      const answerPosition = toPinPositionFromString(answer.answer)

      const distance = calculateDistanceNorm(correctPosition, answerPosition)

      const radius = QUESTION_PIN_TOLERANCE_RADIUS[tolerance]

      return distance <= radius
    })
  }

  if (isPuzzleAnswer(answer)) {
    return correctAnswers
      .filter(isPuzzleCorrectAnswer)
      .some((correct) => isPuzzleQuestionAnswerCorrect(correct, answer))
  }

  return false
}

/**
 * Calculates the score for a Range question in Classic mode.
 *
 * Score is a combination of:
 * 1. Speed-based score (20% of total points)
 * 2. Precision-based score (80%), reduced based on distance from the correct answer.
 *
 * @param correctAnswers - List of correct range values to compare against.
 * @param presented - The timestamp when the question was presented.
 * @param question - The range question object with correct value, margin, and points.
 * @param answer - The player's submitted range answer.
 * @returns The total score based on precision and response speed.
 */
export function calculateClassicModeRangeQuestionScore(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  presented: Date,
  question: BaseQuestionDao & QuestionRangeDao,
  answer: QuestionTaskBaseAnswer & QuestionTaskRangeAnswer,
): number {
  const { margin, min, max, step, duration, points } = question
  const { answer: userAnswer, created: answered } = answer

  // If the answer is not correct based on the question logic, return 0
  if (
    !isQuestionAnswerCorrect(correctAnswers, answer, { margin, min, max, step })
  ) {
    return 0
  }

  // Calculate speed-based score (20%)
  const speedScore =
    calculateClassicModeRawScore(presented, answered, duration, points) * 0.2

  // Special handling for None margin (exact match required)
  if (margin === QuestionRangeAnswerMargin.None) {
    return Math.round(speedScore + points * 0.8) // Full precision score for exact matches
  }

  const scores = correctAnswers
    .filter(isRangeCorrectAnswer)
    .map(({ value }) => {
      // For other margins, calculate precision-based score (80%)
      const { lower, upper } = calculateRangeBounds(
        margin,
        value,
        min,
        max,
        step,
      )

      // distance from the correct value
      const difference = Math.abs(value - userAnswer)

      // use the larger side in case bounds are asymmetric near edges
      const radius = Math.max(value - lower, upper - value)

      // precision: 1 at the center, 0 at/ beyond the edge
      const precisionMultiplier =
        radius > 0
          ? Math.max(0, 1 - difference / radius)
          : userAnswer === value
            ? 1
            : 0

      const precisionScore = points * precisionMultiplier * 0.8

      // Total score: sum of speed and precision scores
      return Math.round(speedScore + precisionScore)
    })
    .sort((lhs, rhs) => rhs - lhs)

  return scores[0] ?? 0
}

/**
 * Calculates the score for a Pin question in Classic mode.
 *
 * Score components:
 * 1) Speed (20%): derived from `calculateClassicModeRawScore`.
 * 2) Precision (80%): linearly scaled by distance within the tolerance radius.
 *
 * Rules:
 * - If the Pin answer is outside the tolerance radius, the total score is `0`.
 * - When multiple correct Pin positions are provided, the highest resulting score
 *   (i.e., nearest correct point) is used.
 *
 * @param correctAnswers - List of correct Pin values (as `"x,y"` strings).
 * @param presented - Timestamp when the question was presented.
 * @param question - The Pin question with tolerance and points.
 * @param answer - The player's submitted Pin answer (`"x,y"`).
 * @returns The total score for this answer.
 */
export function calculateClassicModePinQuestionScore(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  presented: Date,
  question: BaseQuestionDao & QuestionPinDao,
  answer: QuestionTaskBaseAnswer & QuestionTaskPinAnswer,
): number {
  const { tolerance, duration, points } = question
  const { answer: userAnswer, created: answered } = answer

  // If the answer is not correct based on the question logic, return 0
  if (!isQuestionAnswerCorrect(correctAnswers, answer, undefined, tolerance)) {
    return 0
  }

  // Calculate speed-based score (20%)
  const speedScore =
    calculateClassicModeRawScore(presented, answered, duration, points) * 0.2

  // For other tolerances, calculate precision-based score (80%)
  const scores = correctAnswers
    .filter(isPinCorrectAnswer)
    .map(({ value: correctValueString }) => {
      const correctPosition = toPinPositionFromString(correctValueString)
      const answerPosition = toPinPositionFromString(userAnswer)

      const distance = calculateDistanceNorm(correctPosition, answerPosition)

      const radius = QUESTION_PIN_TOLERANCE_RADIUS[tolerance]

      if (distance > radius) return 0

      const precisionMultiplier = 1 - distance / radius // linear
      const precisionScore = points * precisionMultiplier * 0.8

      // Total score: sum of speed and precision scores
      return Math.round(speedScore + precisionScore)
    })
    .sort((lhs, rhs) => rhs - lhs)

  // Keep the highest score
  return scores[0] ?? 0
}

/**
 * Calculates the score for a player's answer in Classic mode.
 *
 * Dispatches to the type-specific scorer when needed:
 * - Range → `calculateClassicModeRangeQuestionScore`
 * - Pin   → `calculateClassicModePinQuestionScore`
 * - Otherwise: returns max speed-based score if answer is correct; 0 if not.
 *
 * @param correctAnswers - The set of correct answers for the question.
 * @param presented - The time when the question was presented.
 * @param question - The question being scored.
 * @param answer - The player's submitted answer.
 * @returns The computed score for the given answer.
 */
export function calculateClassicModeScore(
  presented: Date,
  question: QuestionDao,
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
      | QuestionTaskPinAnswer
      | QuestionTaskPuzzleAnswer
    ),
): number {
  if (isRangeQuestion(question) && isRangeAnswer(answer)) {
    return calculateClassicModeRangeQuestionScore(
      correctAnswers,
      presented,
      question,
      answer,
    )
  }

  if (isPinQuestion(question) && isPinAnswer(answer)) {
    return calculateClassicModePinQuestionScore(
      correctAnswers,
      presented,
      question,
      answer,
    )
  }

  if (isPuzzleQuestion(question) && isPuzzleAnswer(answer)) {
    const scores = correctAnswers
      .filter(isPuzzleCorrectAnswer)
      .map((correct) =>
        calculatePuzzleScore(
          presented,
          question.duration,
          question.points,
          correct,
          answer,
        ),
      )
      .sort((lhs, rhs) => rhs - lhs)
    return scores[0] ?? 0
  }

  if (!isQuestionAnswerCorrect(correctAnswers, answer, undefined)) {
    return 0
  }

  const rawScore = calculateClassicModeRawScore(
    presented,
    answer.created,
    question.duration,
    question.points,
  )
  return Math.round(rawScore)
}

/**
 * Calculates the score for a Range question in "Zero to One Hundred" mode.
 *
 * - Returns -10 for exact matches.
 * - Returns absolute difference for other answers within [0, 100].
 * - Returns 100 for invalid or out-of-range answers.
 *
 * @param correctAnswers - List of correct numeric values to validate against.
 * @param question - The question being answered.
 * @param answer - The player's submitted answer.
 * @returns A score between -10 and 100 based on proximity or correctness.
 */
export function calculateZeroToOneHundredModeScore(
  correctAnswers: QuestionResultTaskCorrectAnswer[],
  question: QuestionDao,
  answer?: QuestionTaskBaseAnswer &
    (
      | QuestionTaskMultiChoiceAnswer
      | QuestionTaskRangeAnswer
      | QuestionTaskTrueFalseAnswer
      | QuestionTaskTypeAnswerAnswer
      | QuestionTaskPinAnswer
      | QuestionTaskPuzzleAnswer
    ),
): number {
  // Return max penalty if question or answer is invalid
  if (!isRangeQuestion(question) || !isRangeAnswer(answer)) {
    return 100
  }

  const scores = correctAnswers
    .filter(isRangeCorrectAnswer)
    .map(({ value }) => {
      // Return max penalty if out of range
      if (answer.answer < 0 || answer.answer > 100) {
        return 100
      }

      // Return -10 for exact match
      if (answer.answer === value) {
        return -10
      }

      // Return absolute difference otherwise
      return Math.abs(answer.answer - value)
    })
    .sort((lhs, rhs) => lhs - rhs)

  // Return lowest score or 100 if no scores available
  return scores[0] ?? 100
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

  const rangeData = isRangeQuestion(question)
    ? {
        margin: question.margin,
        min: question.min,
        max: question.max,
        step: question.step,
      }
    : undefined
  const tolerance = isPinQuestion(question) ? question.tolerance : undefined

  const correct = isQuestionAnswerCorrect(
    correctAnswers,
    answer,
    rangeData,
    tolerance,
  )

  const lastScore =
    mode === GameMode.Classic
      ? calculateClassicModeScore(presented, question, correctAnswers, answer)
      : calculateZeroToOneHundredModeScore(correctAnswers, question, answer)

  const totalScore = previousScore + lastScore

  const streak = correct ? currentStreak + 1 : 0

  return {
    type,
    playerId: participantId,
    nickname,
    answer,
    correct,
    lastScore,
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
