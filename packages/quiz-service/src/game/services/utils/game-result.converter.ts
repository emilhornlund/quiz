import { GameParticipantType } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { QuestionDao } from '../../../quiz/services/models/schemas'
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
} from '../models/schemas'

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

  const { name, participants, currentTask, previousTasks, questions } =
    gameDocument

  const host = participants.find((p) => p.type === GameParticipantType.HOST)
    ?.client?.player

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
    host,
    players: buildPlayerMetric(
      questions,
      questionTasks,
      currentTask.leaderboard,
      questionResultTasks,
      playerParticipants,
    ),
    questions: buildQuestionMetric(
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
 * @param questions - The list of questions in the game.
 * @param questionTasks - All tasks where questions were presented to players.
 * @param leaderboard - Final leaderboard data from the Podium task.
 * @param questionResultTasks - Tasks containing player answers and correctness for each question.
 * @param playerParticipants - All participants in the game with type PLAYER.
 * @returns An array of PlayerMetric objects containing stats for each player.
 */
function buildPlayerMetric(
  questions: QuestionDao[],
  questionTasks: (BaseTask & QuestionTask)[],
  leaderboard: LeaderboardTaskItem[],
  questionResultTasks: (BaseTask & QuestionResultTask)[],
  playerParticipants: (ParticipantBase & ParticipantPlayer)[],
): PlayerMetric[] {
  return playerParticipants.map((player) => {
    const { position: rank = 0, score = 0 } =
      leaderboard.find(
        ({ playerId }) => playerId === player.client.player._id,
      ) || {}
    return questionResultTasks.reduce(
      (accumulator, { results }) => {
        const { correct, answer, streak } = results.find(
          ({ playerId }) => playerId === player.client.player._id,
        )
        return {
          ...accumulator,
          correct: accumulator.correct + (correct && answer ? 1 : 0),
          incorrect: accumulator.incorrect + (!correct && answer ? 1 : 0),
          unanswered: accumulator.unanswered + (answer ? 0 : 1),
          averageResponseTime: calculateAverageResponseTimeByPlayer(
            player,
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
        player: player.client.player,
        rank,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        averageResponseTime: 0,
        longestCorrectStreak: 0,
        score,
      },
    )
  })
}

/**
 * Builds question-specific metrics (e.g., correct/incorrect counts, average response time) for the final GameResult.
 *
 * @param questions - The list of all questions in the game.
 * @param questionResultTasks - Tasks containing answers and results for each question.
 * @param questionTasks - Tasks that define when each question was presented.
 * @param playerParticipants - All participants in the game with type PLAYER.
 * @returns An array of QuestionMetric objects representing question performance.
 */
function buildQuestionMetric(
  questions: QuestionDao[],
  questionResultTasks: (BaseTask & QuestionResultTask)[],
  questionTasks: (BaseTask & QuestionTask)[],
  playerParticipants: (ParticipantBase & ParticipantPlayer)[],
): QuestionMetric[] {
  return questionResultTasks.map(({ results, questionIndex }) => {
    const { text, type } = questions[questionIndex]
    return results.reduce(
      (accumulator, { correct, answer }) => ({
        ...accumulator,
        correct: accumulator.correct + (correct && answer ? 1 : 0),
        incorrect: accumulator.incorrect + (!correct && answer ? 1 : 0),
        unanswered:
          accumulator.unanswered + (typeof answer === 'undefined' ? 1 : 0),
      }),
      {
        text,
        type,
        correct: 0,
        incorrect: 0,
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
          .find(
            ({ playerId }) => playerId === playerParticipant.client.player._id,
          )
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
