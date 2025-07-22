import { BSONValue } from 'bson'
import { v4 as uuidv4 } from 'uuid'

import {
  assertIsDefined,
  BSONDocument,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

/**
 * Transforms a document from the `game_results` collection into a `game_results` document format.
 *
 * @param document - A single document from the original `game_results` collection.
 * @returns The transformed `game_results`-format document.
 */
export function transformGameResultsDocument(
  document: BSONDocument,
): BSONDocument {
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    name: extractValueOrThrow<string>(document, {}, 'name'),
    game: extractValueOrThrow<string>(document, {}, 'game'),
    hostParticipantId: extractValueOrThrow<string>(
      document,
      {},
      'hostParticipantId',
      'host',
    ),
    players: extractValueOrThrow<BSONDocument[]>(document, {}, 'players').map(
      (player) => ({
        participantId: extractValueOrThrow<string>(
          player,
          {},
          'participantId',
          'player',
        ),
        nickname: extractValue<string>(player, {}, 'nickname') || '$UNKNOWN',
        rank: extractValueOrThrow<number>(player, {}, 'rank'),
        correct: extractValue<number>(player, {}, 'correct'),
        incorrect: extractValue<number>(player, {}, 'incorrect'),
        averagePrecision: extractValue<number>(player, {}, 'averagePrecision'),
        unanswered: extractValueOrThrow<number>(player, {}, 'unanswered'),
        averageResponseTime: extractValueOrThrow<number>(
          player,
          {},
          'averageResponseTime',
        ),
        longestCorrectStreak: extractValueOrThrow<number>(
          player,
          {},
          'longestCorrectStreak',
        ),
        score: extractValueOrThrow<number>(player, {}, 'score'),
      }),
    ),
    questions: extractValueOrThrow<BSONDocument[]>(
      document,
      {},
      'questions',
    ).map((question) => ({
      text: extractValueOrThrow<string>(question, {}, 'text'),
      type: extractValueOrThrow<string>(question, {}, 'type'),
      correct: extractValue<number>(question, {}, 'correct'),
      incorrect: extractValue<number>(question, {}, 'incorrect'),
      averagePrecision: extractValue<number>(question, {}, 'averagePrecision'),
      unanswered: extractValueOrThrow<number>(question, {}, 'unanswered'),
      averageResponseTime: extractValueOrThrow<number>(
        question,
        {},
        'averageResponseTime',
      ),
    })),
    hosted: toDate(extractValueOrThrow<string>(document, {}, 'hosted')),
    completed: toDate(extractValueOrThrow<string>(document, {}, 'completed')),
  }
}

/**
 * Transforms a document from the `games` collection into a `game_results` document format.
 *
 * @param document - A single document from the original `games` collection.
 * @returns The transformed `game_results`-format document.
 */
export function transformGameResultsDocumentFromGameDocument(
  document: BSONDocument,
): BSONDocument {
  const mode = extractValueOrThrow<string>(document, {}, 'mode')

  const playerParticipants = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'participants',
  ).filter(
    (participant) =>
      extractValueOrThrow<string>(participant, {}, 'type') === 'PLAYER',
  )

  const questionTasks = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'previousTasks',
  ).filter(
    (task) => extractValueOrThrow<string>(task, {}, 'type') === 'QUESTION',
  )

  const questionResultTasks = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'previousTasks',
  ).filter(
    (task) =>
      extractValueOrThrow<string>(task, {}, 'type') === 'QUESTION_RESULT',
  )

  const questions = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'questions',
  )

  const leaderboard = getPodiumLeaderboardFromGameDocument(document)

  return {
    _id: uuidv4(),
    __v: 0,
    name: extractValueOrThrow<string>(document, {}, 'name'),
    game: extractValueOrThrow<string>(document, {}, '_id'),
    hostParticipantId: extractValueOrThrow<string>(
      extractValueOrThrow<BSONDocument[]>(document, {}, 'participants').find(
        (participant) => participant.type === 'HOST',
      ) as BSONDocument,
      {},
      'participantId',
    ),
    players: buildPlayerMetrics(
      mode,
      questions,
      questionTasks,
      leaderboard,
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
    hosted: toDate(extractValueOrThrow<string>(document, {}, 'created')),
    completed: toDate(extractValueOrThrow<string>(document, {}, 'updated')),
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
  mode: string,
  questions: BSONDocument[],
  questionTasks: BSONDocument[],
  leaderboard: BSONDocument[],
  questionResultTasks: BSONDocument[],
  playerParticipants: BSONDocument[],
): BSONDocument[] {
  return playerParticipants
    .map((participantPlayer) => {
      const participantId = extractValueOrThrow<string>(
        participantPlayer,
        {},
        'participantId',
      )

      const playerLeaderboardItem = assertIsDefined(
        leaderboard.find(
          (item) =>
            extractValueOrThrow<string>(item, {}, 'playerId') === participantId,
        ),
      )

      const rank = extractValueOrThrow<number>(
        playerLeaderboardItem,
        {},
        'position',
      )
      const score = extractValueOrThrow<number>(
        playerLeaderboardItem,
        {},
        'score',
      )

      return questionResultTasks.reduce(
        (accumulator, currentValue) => {
          const results = extractValueOrThrow<BSONDocument[]>(
            currentValue,
            {},
            'results',
          )

          const resultItem = assertIsDefined(
            results.find(
              (item) =>
                extractValueOrThrow<string>(item, {}, 'playerId') ===
                participantId,
            ),
          )

          const correct = extractValue<boolean>(resultItem, {}, 'correct')
          const answer = extractValue<BSONValue>(resultItem, {}, 'answer')
          const streak = extractValueOrThrow<number>(resultItem, {}, 'streak')
          const lastScore = extractValueOrThrow<number>(
            resultItem,
            {},
            'lastScore',
          )

          return {
            ...accumulator,
            correct:
              mode === 'CLASSIC'
                ? extractValueOrThrow<number>(accumulator, {}, 'correct') +
                  (correct && answer ? 1 : 0)
                : null,
            incorrect:
              mode === 'CLASSIC'
                ? extractValueOrThrow<number>(accumulator, {}, 'incorrect') +
                  (!correct && answer ? 1 : 0)
                : null,
            averagePrecision:
              mode === 'ZERO_TO_ONE_HUNDRED'
                ? extractValueOrThrow<number>(
                    accumulator,
                    {},
                    'averagePrecision',
                  ) +
                  (100 - Math.max(lastScore, 0)) / 100
                : null,
            unanswered:
              extractValueOrThrow<number>(accumulator, {}, 'unanswered') +
              (answer ? 0 : 1),
            averageResponseTime: calculateAverageResponseTimeByPlayer(
              participantPlayer,
              questionTasks,
              questions,
            ),
            longestCorrectStreak:
              streak >
              extractValueOrThrow<number>(
                accumulator,
                {},
                'longestCorrectStreak',
              )
                ? streak
                : accumulator.longestCorrectStreak,
          }
        },
        {
          participantId: participantPlayer.participantId,
          nickname: participantPlayer.nickname,
          rank,
          correct: mode === 'CLASSIC' ? 0 : null,
          incorrect: mode === 'CLASSIC' ? 0 : null,
          averagePrecision: mode === 'ZERO_TO_ONE_HUNDRED' ? 0 : null,
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
        mode === 'ZERO_TO_ONE_HUNDRED'
          ? Number(
              (
                extractValueOrThrow<number>(metric, {}, 'averagePrecision') /
                questionResultTasks.length
              ).toFixed(2),
            )
          : null,
    }))
    .sort(
      (lhs, rhs) =>
        extractValueOrThrow<number>(lhs, {}, 'rank') -
        extractValueOrThrow<number>(rhs, {}, 'rank'),
    )
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
  mode: string,
  questions: BSONDocument[],
  questionResultTasks: BSONDocument[],
  questionTasks: BSONDocument[],
  playerParticipants: BSONDocument[],
): BSONDocument[] {
  return questionResultTasks
    .map((questionResultTask) => {
      const results = extractValueOrThrow<BSONDocument[]>(
        questionResultTask,
        {},
        'results',
      )
      const questionIndex = extractValueOrThrow<number>(
        questionResultTask,
        {},
        'questionIndex',
      )

      const question = questions[questionIndex]
      const text = extractValueOrThrow<string>(question, {}, 'text')
      const type = extractValueOrThrow<string>(question, {}, 'type')

      //{ correct, answer, lastScore }
      return results.reduce(
        (accumulator, resultItem) => {
          const correct = extractValue<boolean>(resultItem, {}, 'correct')
          const answer = extractValue<BSONValue>(resultItem, {}, 'answer')
          const lastScore = extractValueOrThrow<number>(
            resultItem,
            {},
            'lastScore',
          )

          return {
            ...accumulator,
            correct:
              mode === 'CLASSIC'
                ? extractValueOrThrow<number>(accumulator, {}, 'correct') +
                  (correct && answer ? 1 : 0)
                : null,
            incorrect:
              mode === 'CLASSIC'
                ? extractValueOrThrow<number>(accumulator, {}, 'incorrect') +
                  (!correct && answer ? 1 : 0)
                : null,
            averagePrecision:
              mode === 'ZERO_TO_ONE_HUNDRED'
                ? extractValueOrThrow<number>(
                    accumulator,
                    {},
                    'averagePrecision',
                  ) +
                  (100 - Math.max(lastScore, 0)) / 100
                : null,
            unanswered:
              extractValueOrThrow<number>(accumulator, {}, 'unanswered') +
              (typeof answer === 'undefined' ? 1 : 0),
          }
        },
        {
          text,
          type,
          correct: mode === 'CLASSIC' ? 0 : null,
          incorrect: mode === 'CLASSIC' ? 0 : null,
          averagePrecision: mode === 'ZERO_TO_ONE_HUNDRED' ? 0 : null,
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
        mode === 'ZERO_TO_ONE_HUNDRED'
          ? Number(
              (
                extractValueOrThrow<number>(metric, {}, 'averagePrecision') /
                playerParticipants.length
              ).toFixed(2),
            )
          : null,
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
  playerParticipant: BSONDocument,
  questionTasks: BSONDocument[],
  questions: BSONDocument[],
): number {
  const participantId = extractValueOrThrow<string>(
    playerParticipant,
    {},
    'participantId',
  )

  const totalResponseTime = questionTasks
    .map((questionTask) => {
      const presented = toDate(
        extractValueOrThrow<string>(questionTask, {}, 'presented'),
      ) as Date

      const answers = extractValueOrThrow<BSONDocument[]>(
        questionTask,
        {},
        'answers',
      )

      const questionIndex = extractValueOrThrow<number>(
        questionTask,
        {},
        'questionIndex',
      )

      const answerCreated = toDate(
        extractValue<string>(
          answers.find(
            (answer) =>
              extractValueOrThrow<string>(answer, {}, 'playerId') ===
              participantId,
          ) || {},
          {},
          'created',
        ),
      )

      return {
        presentedTime: presented.getTime(),
        answerTime:
          answerCreated?.getTime() ||
          presented.getTime() +
            extractValueOrThrow<number>(
              questions[questionIndex],
              {},
              'duration',
            ) *
              1000,
      }
    })
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
  questionTask: BSONDocument,
  questions: BSONDocument[],
  playerParticipants: BSONDocument[],
): number {
  const presented = toDate(
    extractValueOrThrow<string>(questionTask, {}, 'presented'),
  ) as Date

  const answers = extractValueOrThrow<BSONDocument[]>(
    questionTask,
    {},
    'answers',
  )

  const questionIndex = extractValueOrThrow<number>(
    questionTask,
    {},
    'questionIndex',
  )

  const totalAnsweredResponseTime = answers.reduce(
    (accumulator, answer) =>
      accumulator +
      ((
        toDate(extractValueOrThrow<string>(answer, {}, 'created')) as Date
      ).getTime() -
        presented.getTime()),
    0,
  )

  const totalUnanswered = playerParticipants.length - answers.length
  const totalUnansweredResponseTime =
    totalUnanswered *
    extractValueOrThrow<number>(questions[questionIndex], {}, 'duration') *
    1000

  return answers.length + totalUnanswered
    ? Math.floor(
        (totalAnsweredResponseTime + totalUnansweredResponseTime) /
          (answers.length + totalUnanswered),
      )
    : 0
}

/**
 * Extracts the leaderboard array from a completed game document, whether
 * in `currentTask` (PODIUM) or the last previousTask if they quit.
 *
 * @param gameDocument - The original game document with tasks.
 * @returns The array of leaderboard items.
 * @throws {Error} If no PODIUM task is found in current or previous tasks.
 */
function getPodiumLeaderboardFromGameDocument(
  gameDocument: BSONDocument,
): BSONDocument[] {
  const currentTask = extractValueOrThrow<BSONDocument>(
    gameDocument,
    {},
    'currentTask',
  )

  const currentTaskType = extractValueOrThrow(currentTask, {}, 'type')

  if (currentTaskType === 'PODIUM') {
    return extractValueOrThrow<BSONDocument[]>(currentTask, {}, 'leaderboard')
  }

  if (currentTaskType === 'QUIT') {
    const previousTasks = extractValueOrThrow<BSONDocument[]>(
      gameDocument,
      {},
      'previousTasks',
    )

    if (previousTasks.length > 0) {
      const previousTask = previousTasks[previousTasks.length - 1]
      const previousTaskType = extractValueOrThrow(previousTask, {}, 'type')

      if (previousTaskType === 'PODIUM') {
        return extractValueOrThrow<BSONDocument[]>(
          previousTask,
          {},
          'leaderboard',
        )
      }
    }
  }
  throw new Error(`Unexpected current task type: ${currentTaskType}`)
}
