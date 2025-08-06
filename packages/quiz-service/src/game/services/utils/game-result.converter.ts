import { GameMode, GameParticipantType } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { QuestionDao } from '../../../quiz/repositories/models/schemas'
import { IllegalTaskTypeException } from '../../exceptions'
import {
  BaseTask,
  GameDocument,
  GameResult,
  LeaderboardTaskItem,
  ParticipantBase,
  ParticipantPlayer,
  PlayerMetric,
  QuestionMetric,
  QuestionResultTask,
  QuestionTask,
  TaskType,
} from '../../repositories/models/schemas'

/**
 * Builds the final GameResult model based on the provided game document.
 * This is only allowed when the game has reached the Podium task stage.
 *
 * @param gameDocument - The full game document including all tasks, questions, and participants.
 * @returns A structured GameResult object containing performance data.
 * @throws {IllegalTaskTypeException} If the current task type is not `Podium`.
 */
export function buildGameResultModel(gameDocument: GameDocument): GameResult {
  if (gameDocument.currentTask.type !== TaskType.Podium) {
    throw new IllegalTaskTypeException(
      gameDocument.currentTask.type,
      TaskType.Podium,
    )
  }

  const { mode, name, participants, currentTask, previousTasks, questions } =
    gameDocument

  const hostParticipantId = participants.find(
    (p) => p.type === GameParticipantType.HOST,
  )?.participantId

  const playerParticipants: (ParticipantBase & ParticipantPlayer)[] =
    participants
      .filter(({ type }) => type === GameParticipantType.PLAYER)
      .map((player) => player as ParticipantBase & ParticipantPlayer)

  const questionTasks = getTasksOfType<BaseTask & QuestionTask>(
    previousTasks,
    TaskType.Question,
  )

  const questionResultTasks = getTasksOfType<BaseTask & QuestionResultTask>(
    previousTasks,
    TaskType.QuestionResult,
  )

  const hosted =
    previousTasks.find(({ type }) => type === TaskType.Question)?.created ??
    null

  const { created: completed } = currentTask

  return {
    _id: uuidv4(),
    name,
    game: gameDocument,
    hostParticipantId,
    players: buildPlayerMetrics(
      mode,
      questions,
      questionTasks,
      currentTask.leaderboard,
      questionResultTasks,
      playerParticipants,
    ),
    questions: buildQuestionMetrics(
      mode,
      questions,
      questionResultTasks,
      questionTasks,
      playerParticipants,
    ),
    hosted,
    completed,
  }
}

/**
 * Builds player-specific metrics (e.g., correct answers, score, response times) for the final GameResult.
 *
 * @param mode - The game mode to determine which metrics to calculate.
 * @param questions - The list of questions in the game.
 * @param questionTasks - All tasks where questions were presented to players.
 * @param leaderboard - Final leaderboard data from the Podium task.
 * @param questionResultTasks - Tasks containing player answers and correctness for each question.
 * @param playerParticipants - All participants in the game with type PLAYER.
 * @returns An array of PlayerMetric objects containing stats for each player.
 */
function buildPlayerMetrics(
  mode: GameMode,
  questions: QuestionDao[],
  questionTasks: (BaseTask & QuestionTask)[],
  leaderboard: LeaderboardTaskItem[],
  questionResultTasks: (BaseTask & QuestionResultTask)[],
  playerParticipants: (ParticipantBase & ParticipantPlayer)[],
): PlayerMetric[] {
  return playerParticipants
    .map((participantPlayer) => {
      const { position: rank = 0, score = 0 } =
        leaderboard.find(
          ({ playerId }) => playerId === participantPlayer.participantId,
        ) || {}
      return questionResultTasks.reduce(
        (accumulator, { results }) => {
          const { correct, answer, streak, lastScore } = results.find(
            ({ playerId }) => playerId === participantPlayer.participantId,
          )
          return {
            ...accumulator,
            correct:
              mode === GameMode.Classic
                ? accumulator.correct + (correct && answer ? 1 : 0)
                : undefined,
            incorrect:
              mode === GameMode.Classic
                ? accumulator.incorrect + (!correct && answer ? 1 : 0)
                : undefined,
            averagePrecision:
              mode === GameMode.ZeroToOneHundred
                ? accumulator.averagePrecision +
                  (100 - Math.max(lastScore, 0)) / 100
                : undefined,
            unanswered: accumulator.unanswered + (answer ? 0 : 1),
            averageResponseTime: calculateAverageResponseTimeByPlayer(
              participantPlayer,
              questionTasks,
              questions,
            ),
            longestCorrectStreak:
              streak > accumulator.longestCorrectStreak
                ? streak
                : accumulator.longestCorrectStreak,
          }
        },
        {
          participantId: participantPlayer.participantId,
          nickname: participantPlayer.nickname,
          rank,
          correct: mode === GameMode.Classic ? 0 : undefined,
          incorrect: mode === GameMode.Classic ? 0 : undefined,
          averagePrecision: mode === GameMode.ZeroToOneHundred ? 0 : undefined,
          unanswered: 0,
          averageResponseTime: 0,
          longestCorrectStreak: 0,
          score,
        },
      )
    })
    .map((metric) => ({
      ...metric,
      averagePrecision:
        mode === GameMode.ZeroToOneHundred
          ? Number(
              (metric.averagePrecision / questionResultTasks.length).toFixed(2),
            )
          : undefined,
    }))
    .sort((lhs, rhs) => lhs.rank - rhs.rank)
}

/**
 * Builds question-specific metrics (e.g., correct/incorrect counts, average response time) for the final GameResult.
 *
 * @param mode - The game mode to determine which metrics to calculate.
 * @param questions - The list of all questions in the game.
 * @param questionResultTasks - Tasks containing answers and results for each question.
 * @param questionTasks - Tasks that define when each question was presented.
 * @param playerParticipants - All participants in the game with type PLAYER.
 * @returns An array of QuestionMetric objects representing question performance.
 */
function buildQuestionMetrics(
  mode: GameMode,
  questions: QuestionDao[],
  questionResultTasks: (BaseTask & QuestionResultTask)[],
  questionTasks: (BaseTask & QuestionTask)[],
  playerParticipants: (ParticipantBase & ParticipantPlayer)[],
): QuestionMetric[] {
  return questionResultTasks
    .map(({ results, questionIndex }) => {
      const { text, type } = questions[questionIndex]
      return results.reduce(
        (accumulator, { correct, answer, lastScore }) => ({
          ...accumulator,
          correct:
            mode === GameMode.Classic
              ? accumulator.correct + (correct && answer ? 1 : 0)
              : undefined,
          incorrect:
            mode === GameMode.Classic
              ? accumulator.incorrect + (!correct && answer ? 1 : 0)
              : undefined,
          averagePrecision:
            mode === GameMode.ZeroToOneHundred
              ? accumulator.averagePrecision +
                (100 - Math.max(lastScore, 0)) / 100
              : undefined,
          unanswered:
            accumulator.unanswered + (typeof answer === 'undefined' ? 1 : 0),
        }),
        {
          text,
          type,
          correct: mode === GameMode.Classic ? 0 : undefined,
          incorrect: mode === GameMode.Classic ? 0 : undefined,
          averagePrecision: mode === GameMode.ZeroToOneHundred ? 0 : undefined,
          unanswered: 0,
          averageResponseTime: questionTasks[questionIndex]
            ? calculateAverageResponseTimeByQuestion(
                questionTasks[questionIndex],
                questions,
                playerParticipants,
              )
            : 0,
        },
      )
    })
    .map((metric) => ({
      ...metric,
      averagePrecision:
        mode === GameMode.ZeroToOneHundred
          ? Number(
              (metric.averagePrecision / playerParticipants.length).toFixed(2),
            )
          : undefined,
    }))
}

/**
 * Calculates the average time taken by a specific player to respond to all questions.
 * If a player has not answered a question, the full duration of that question is used as a fallback.
 *
 * @param playerParticipant - The player whose response times should be calculated.
 * @param questionTasks - All tasks where questions were presented.
 * @param questions - The list of all questions in the game.
 * @returns The average response time in milliseconds.
 */
function calculateAverageResponseTimeByPlayer(
  playerParticipant: ParticipantBase & ParticipantPlayer,
  questionTasks: (BaseTask & QuestionTask)[],
  questions: QuestionDao[],
): number {
  const totalResponseTime = questionTasks
    .map(({ presented, answers, questionIndex }) => ({
      presentedTime: presented.getTime(),
      answerTime:
        answers
          .find(({ playerId }) => playerId === playerParticipant.participantId)
          ?.created?.getTime() ||
        presented.getTime() + questions[questionIndex].duration * 1000,
    }))
    .reduce(
      (accumulator, { presentedTime, answerTime }) =>
        accumulator + (answerTime - presentedTime),
      0,
    )

  return questionTasks.length
    ? Math.floor(totalResponseTime / questionTasks.length)
    : 0
}

/**
 * Calculates the average response time for a specific question across all players.
 * For players who did not answer, the question's full duration is used as their response time.
 *
 * @param questionTask - The task representing when the question was shown and who answered it.
 * @param questions - The list of all questions in the game.
 * @param playerParticipants - All participants in the game with type PLAYER.
 * @returns The average response time in milliseconds for the given question.
 */
function calculateAverageResponseTimeByQuestion(
  questionTask: BaseTask & QuestionTask,
  questions: QuestionDao[],
  playerParticipants: (ParticipantBase & ParticipantPlayer)[],
): number {
  const { presented, answers, questionIndex } = questionTask

  const totalAnsweredResponseTime = answers.reduce(
    (accumulator, { created }) =>
      accumulator + (created.getTime() - presented.getTime()),
    0,
  )

  const totalUnanswered = playerParticipants.length - answers.length
  const totalUnansweredResponseTime =
    totalUnanswered * questions[questionIndex].duration * 1000

  return answers.length + totalUnanswered
    ? Math.floor(
        (totalAnsweredResponseTime + totalUnansweredResponseTime) /
          (answers.length + totalUnanswered),
      )
    : 0
}

/**
 * Filters the list of tasks by the given task type and returns them cast to the appropriate subtype.
 *
 * @param tasks - The full list of previous game tasks.
 * @param type - The specific TaskType to filter by.
 * @returns An array of tasks of the given type, cast to type T.
 */
function getTasksOfType<T>(tasks: BaseTask[], type: TaskType): T[] {
  return tasks.filter((t) => t.type === type).map((t) => t as T)
}
