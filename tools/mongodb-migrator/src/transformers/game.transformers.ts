import { v4 as uuidv4 } from 'uuid'

import {
  BSONDocument,
  ClientPlayerMapper,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

import { buildQuizQuestions } from './quiz.transformers'

type ExtractNicknameFallbackFn = (playerId: string) => string

/**
 * Overrides legacy player IDs to their new canonical equivalents.
 *
 * @param playerId - The original player ID that may need remapping.
 * @returns The mapped player ID if an override exists; otherwise, returns the input ID unchanged.
 */
function overridePlayerId(playerId: string): string {
  const overrides: Record<string, string> = {
    '7c2ced9f-0532-4534-9ab5-58f22bbb76e1':
      '7f073e83-871b-4de5-9b62-1e7b36edd088',
    '25c84c1c-a6ac-4f98-9e2b-05c295920274':
      '23673f52-7b37-4c3d-8473-49620e7ca2fe',
  }
  return overrides[playerId] || playerId
}

/**
 * Transforms a document from the `games` collection into a `games` document format.
 *
 * @param document - A single document from the original `games` collection.
 * @param clientPlayerMapper - Mapper used for game‐related ID/nickname lookups.
 * @returns The transformed `games`-format document.
 */
export function transformGameDocument(
  document: BSONDocument,
  clientPlayerMapper: ClientPlayerMapper,
): BSONDocument {
  const extractFallbackNickname = (playerId: string): string => {
    const previousTasks = extractValueOrThrow<Array<BSONDocument>>(
      document,
      {},
      'previousTasks',
    )
    const leaderboardTask = previousTasks.find(
      (task) => task.type === 'LEADERBOARD',
    )
    if (leaderboardTask) {
      const leaderboardItem = extractValueOrThrow<Array<BSONDocument>>(
        leaderboardTask,
        {},
        'leaderboard',
      ).find(
        (task) =>
          extractValueOrThrow<string>(task, {}, 'playerId') === playerId,
      )
      if (leaderboardItem) {
        return extractValueOrThrow<string>(leaderboardItem, {}, 'nickname')
      }
    }
    return clientPlayerMapper.findPlayerNicknameByPlayerId(playerId)
  }

  const questions = buildQuizQuestions(document)

  const tmpCurrentTask = buildGameTask(
    extractValueOrThrow<BSONDocument>(document, {}, 'currentTask'),
    questions,
    extractFallbackNickname,
  )
  const tmpCurrentTaskType = extractValueOrThrow<string>(
    tmpCurrentTask,
    {},
    'type',
  )

  const currentTask =
    tmpCurrentTaskType === 'PODIUM'
      ? {
          _id: uuidv4(),
          type: 'QUIT',
          status: 'completed',
          created: toDate(
            extractValueOrThrow<string>(tmpCurrentTask, {}, 'created'),
          ),
        }
      : tmpCurrentTask

  const tmpPreviousTasks = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'previousTasks',
  ).map((task) => buildGameTask(task, questions, extractFallbackNickname))

  const previousTasks =
    tmpCurrentTaskType === 'PODIUM'
      ? [...tmpPreviousTasks, tmpCurrentTask]
      : tmpPreviousTasks

  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    name: extractValueOrThrow<string>(document, {}, 'name'),
    mode: extractValueOrThrow<string>(document, {}, 'mode'),
    status: buildGameStatus(document, currentTask),
    pin: extractValueOrThrow<string>(document, {}, 'pin'),
    quiz:
      extractValue<string>(document, {}, 'quiz') ||
      buildGameTemporaryQuiz(document, questions, clientPlayerMapper),
    questions,
    nextQuestion: extractValueOrThrow<number>(document, {}, 'nextQuestion'),
    participants: buildGameParticipants(
      document,
      clientPlayerMapper,
      extractFallbackNickname,
    ),
    currentTask,
    previousTasks,
    updated: toDate(
      extractValue<string>(document, {}, 'updated') ||
        extractValueOrThrow<string>(currentTask, {}, 'created'),
    ),
    created: toDate(extractValueOrThrow<string>(document, {}, 'created')),
  }
}

/**
 * Builds a human-readable game status from either the explicit `status`
 * field or infers COMPLETED/EXPIRED based on the current task type.
 *
 * @param document - The original game document.
 * @param currentTask - The task currently in progress.
 * @returns A normalized status string: `COMPLETED`, `EXPIRED`, or the original.
 */
function buildGameStatus(
  document: BSONDocument,
  currentTask: BSONDocument,
): string {
  const status = extractValue<string>(document, {}, 'status')
  if (status) {
    return status
  }

  if (currentTask) {
    const type = extractValueOrThrow<string>(currentTask, {}, 'type')
    if (type === 'QUIT') {
      return 'COMPLETED'
    }
  }

  return 'EXPIRED'
}

/**
 * Generates a temporary quiz document from the embedded questions and
 * participants, used when no quiz ID is present.
 *
 * @param document - The source game document.
 * @param questions - The array of built question documents.
 * @param clientPlayerMapper - For resolving host/client IDs to player IDs.
 * @returns A minimal quiz document to attach to the game.
 */
function buildGameTemporaryQuiz(
  document: BSONDocument,
  questions: Array<BSONDocument>,
  clientPlayerMapper: ClientPlayerMapper,
): BSONDocument {
  const getOwner = () => {
    const hostClientId = extractValue<string>(document, {}, 'hostClientId')
    if (hostClientId) {
      try {
        return clientPlayerMapper.findPlayerIdByClientId(hostClientId)
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error
      ) {
        return uuidv4()
      }
    }

    const participants = extractValue<Array<BSONDocument>>(
      document,
      {},
      'participants',
    )
    if (participants) {
      const participantHost = participants.find(
        (participant) => participant.type === 'HOST',
      )
      if (participantHost) {
        return clientPlayerMapper.findPlayerIdByClientId(
          extractValueOrThrow<string>(participantHost, {}, 'client'),
        )
      }
    }

    throw new Error('No quiz owner found')
  }

  return {
    _id: uuidv4(),
    __v: 0,
    title: extractValueOrThrow<string>(document, {}, 'name'),
    description: null,
    mode: extractValueOrThrow<string>(document, {}, 'mode'),
    visibility: 'PRIVATE',
    category: 'OTHER',
    imageCoverURL: null,
    languageCode: 'en',
    questions,
    owner: getOwner(),
    updated: toDate(extractValueOrThrow<string>(document, {}, 'created')),
    created: toDate(extractValueOrThrow<string>(document, {}, 'created')),
  }
}

/**
 * Constructs the game’s participants array, combining host and players,
 * filling in rank/name/ID as needed from tasks or client-mapper.
 *
 * @param document - The original game document.
 * @param clientPlayerMapper - Mapper from client IDs to player info.
 * @param extractFallbackNickname - Function to get a nickname by player ID.
 * @returns Typed array of participant entries (HOST + PLAYER).
 * @throws {Error} If no participants are found.
 */
function buildGameParticipants(
  document: BSONDocument,
  clientPlayerMapper: ClientPlayerMapper,
  extractFallbackNickname: ExtractNicknameFallbackFn,
): Array<BSONDocument> {
  const currentTask = extractValueOrThrow<BSONDocument>(
    document,
    {},
    'currentTask',
  )

  const previousTasks = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'previousTasks',
  )

  const podiumTask =
    extractValueOrThrow<string>(currentTask, {}, 'type') === 'PODIUM'
      ? currentTask
      : previousTasks.find(
          (task) => extractValueOrThrow<string>(task, {}, 'type') === 'PODIUM',
        )

  const getRankFromPodiumTask = (playerId: string): number => {
    if (podiumTask) {
      const leaderboardTaskItems = extractValueOrThrow<BSONDocument[]>(
        podiumTask,
        {},
        'leaderboard',
      )

      const leaderboardTaskItem = leaderboardTaskItems.find(
        (leaderboardTaskItem) =>
          overridePlayerId(
            extractValueOrThrow<string>(leaderboardTaskItem, {}, 'playerId'),
          ) === playerId,
      )

      if (leaderboardTaskItem) {
        return extractValueOrThrow(leaderboardTaskItem, {}, 'position')
      } else {
        throw new Error(
          `No leaderboard task item found for player ${playerId}.`,
        )
      }
    }
    return -1
  }

  const participants = extractValue<Array<BSONDocument>>(
    document,
    {},
    'participants',
  )
  if (participants) {
    return participants.map((participant) => {
      const type = extractValueOrThrow<string>(participant, {}, 'type')

      const participantId = overridePlayerId(
        extractValue<string>(participant, {}, 'participantId', 'player') ||
          clientPlayerMapper.findPlayerIdByClientId(
            extractValueOrThrow<string>(participant, {}, 'client'),
          ),
      )

      let additional: BSONDocument = {}
      if (type === 'HOST') {
        additional = {
          participantId,
        }
      }
      if (type === 'PLAYER') {
        const rank =
          extractValue<number>(participant, {}, 'rank') ||
          getRankFromPodiumTask(participantId)

        additional = {
          participantId,
          nickname:
            extractValue<string>(participant, {}, 'nickname') ||
            extractFallbackNickname(
              clientPlayerMapper.findPlayerIdByClientId(
                extractValueOrThrow<string>(participant, {}, 'client'),
              ),
            ),
          rank,
          totalScore: extractValueOrThrow<number>(
            participant,
            {},
            'totalScore',
          ),
          currentStreak: extractValueOrThrow<number>(
            participant,
            {},
            'currentStreak',
          ),
          created: toDate(
            extractValueOrThrow<string>(participant, {}, 'created'),
          ),
          updated: toDate(
            extractValueOrThrow<string>(participant, {}, 'updated'),
          ),
        }
      }
      return { type, ...additional }
    })
  }

  const players = extractValue<Array<BSONDocument>>(document, {}, 'players')
  if (players) {
    let hostParticipantId: string
    try {
      hostParticipantId = clientPlayerMapper.findPlayerIdByClientId(
        extractValueOrThrow<string>(document, {}, 'hostClientId'),
      )
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error
    ) {
      hostParticipantId = uuidv4()
    }

    return [
      {
        type: 'HOST',
        participantId: hostParticipantId,
      },
      ...players.map((player) => {
        const playerId = overridePlayerId(
          extractValueOrThrow<string>(player, {}, '_id'),
        )
        return {
          type: 'PLAYER',
          participantId: playerId,
          nickname: extractValueOrThrow<string>(player, {}, 'nickname'),
          rank: getRankFromPodiumTask(playerId),
          totalScore: extractValueOrThrow<number>(player, {}, 'totalScore'),
          currentStreak: extractValueOrThrow<number>(
            player,
            {},
            'currentStreak',
          ),
          created: toDate(extractValueOrThrow<string>(player, {}, 'joined')),
          updated: toDate(extractValueOrThrow<string>(player, {}, 'joined')),
        }
      }),
    ]
  }

  throw new Error('No participants found')
}

/**
 * Converts each raw task document into a normalized task, handling
 * LOBBY, QUESTION, QUESTION_RESULT, LEADERBOARD, PODIUM, QUIT.
 *
 * @param task - Original task sub-document.
 * @param questions - Array of quiz question docs for reference.
 * @param extractFallbackNickname - For missing nicknames in result items.
 * @returns A fully-typed task object for the output schema.
 */
function buildGameTask(
  task: BSONDocument,
  questions: Array<BSONDocument>,
  extractFallbackNickname: ExtractNicknameFallbackFn,
): BSONDocument {
  const type = extractValueOrThrow<string>(task, {}, 'type')
  let additional: BSONDocument = {}
  if (type === 'LOBBY') {
    additional = {}
  } else if (type === 'QUESTION') {
    additional = {
      questionIndex: extractValueOrThrow<number>(task, {}, 'questionIndex'),
      answers: extractValueOrThrow<Array<BSONDocument>>(
        task,
        {},
        'answers',
      ).map((answer) => ({
        type: extractValueOrThrow<string>(answer, {}, 'type'),
        playerId: overridePlayerId(
          extractValueOrThrow<string>(answer, {}, 'playerId'),
        ),
        created: toDate(extractValueOrThrow<string>(answer, {}, 'created')),
        answer:
          {
            MULTI_CHOICE: extractValueOrThrow<number>(answer, {}, 'answer'),
            RANGE: extractValueOrThrow<number>(answer, {}, 'answer'),
            TRUE_FALSE: extractValueOrThrow<boolean>(answer, {}, 'answer'),
            TYPE_ANSWER: extractValueOrThrow<string>(answer, {}, 'answer'),
          }[answer.type as string] || null,
      })),
      presented: toDate(extractValueOrThrow<string>(task, {}, 'presented')),
    }
  } else if (type === 'QUESTION_RESULT') {
    additional = {
      questionIndex: extractValueOrThrow<number>(task, {}, 'questionIndex'),
      correctAnswers: buildGameCorrectAnswers(task, questions),
      results: buildGameQuestionResults(task, extractFallbackNickname),
    }
  } else if (type === 'LEADERBOARD') {
    additional = {
      questionIndex: extractValueOrThrow<number>(task, {}, 'questionIndex'),
      leaderboard: buildGameLeaderboard(task),
    }
  } else if (type === 'PODIUM') {
    additional = {
      leaderboard: buildGameLeaderboard(task),
    }
  } else if (type === 'QUIT') {
    additional = {}
  }
  return {
    _id: extractValue<string>(task, {}, '_id') || uuidv4(),
    type,
    status: extractValueOrThrow<string>(task, {}, 'status'),
    currentTransitionInitiated: extractValueOrThrow<string>(
      task,
      {},
      'currentTransitionInitiated',
      'created',
    ),
    currentTransitionExpires: extractValueOrThrow<string>(
      task,
      {},
      'currentTransitionExpires',
      'created',
    ),
    created: toDate(extractValueOrThrow<string>(task, {}, 'created')),
    ...additional,
  }
}

/**
 * Maps raw `correctAnswers` or derives them from the quiz question options
 * when missing.
 *
 * @param task - QUESTION_RESULT or similar task containing correctAnswers.
 * @param questions - Array of full quiz questions for lookup.
 * @returns Array of correct-answer records (index/value by type).
 * @throws {Error} If no correct answers can be determined.
 */
function buildGameCorrectAnswers(
  task: BSONDocument,
  questions: Array<BSONDocument>,
): Array<BSONDocument> {
  const correctAnswers = extractValue<Array<BSONDocument>>(
    task,
    {},
    'correctAnswers',
  )

  if (correctAnswers) {
    return correctAnswers.map(() => {
      const type = extractValueOrThrow<string>(task, {}, 'type')
      let additional: BSONDocument = {}
      if (type === 'MULTI_CHOICE') {
        additional = {
          index: extractValueOrThrow<number>(task, {}, 'index'),
        }
      }
      if (type === 'RANGE') {
        additional = {
          value: extractValueOrThrow<number>(task, {}, 'value'),
        }
      }
      if (type === 'TRUE_FALSE') {
        additional = {
          value: extractValueOrThrow<boolean>(task, {}, 'value'),
        }
      }
      if (type === 'TYPE_ANSWER') {
        additional = {
          value: extractValueOrThrow<string>(task, {}, 'value'),
        }
      }
      return {
        type,
        ...additional,
      }
    })
  }

  const questionIndex = extractValueOrThrow<number>(task, {}, 'questionIndex')

  if (questionIndex >= 0 && questionIndex < questions.length) {
    const question = questions[questionIndex]
    const type = extractValueOrThrow<string>(question, {}, 'type')
    if (type === 'MULTI_CHOICE') {
      return extractValueOrThrow<Array<BSONDocument>>(question, {}, 'options')
        .map((option, index) => ({
          index,
          correct: extractValueOrThrow<boolean>(option, {}, 'correct'),
        }))
        .filter(({ correct }) => !!correct)
        .map(({ index }) => ({ type, index }))
    }
    if (type === 'RANGE') {
      return [
        {
          type,
          value: extractValueOrThrow<number>(question, {}, 'correct'),
        },
      ]
    }
    if (type === 'TRUE_FALSE') {
      return [
        {
          type,
          value: extractValueOrThrow<boolean>(question, {}, 'correct'),
        },
      ]
    }
    if (type === 'TYPE_ANSWER') {
      return extractValueOrThrow<string[]>(question, {}, 'options').map(
        (option) => ({ type, value: option }),
      )
    }
  }

  throw new Error('No correct answers found')
}

/**
 * Normalizes each player’s per-question result into the unified output format.
 *
 * @param task - QUESTION_RESULT task containing results entries.
 * @param extractFallbackNickname - Fallback for missing player nicknames.
 * @returns Array of result entries with answer, correct, score, streak, etc.
 */
function buildGameQuestionResults(
  task: BSONDocument,
  extractFallbackNickname: ExtractNicknameFallbackFn,
): Array<BSONDocument> {
  return extractValueOrThrow<Array<BSONDocument>>(task, {}, 'results').map(
    (item) => {
      const answer: BSONDocument | null = ((answer: BSONDocument | null) => {
        if (!answer) {
          return null
        }

        const type = extractValueOrThrow<string>(answer, {}, 'type')
        let additional: BSONDocument = {}
        if (type === 'MULTI_CHOICE') {
          additional = {
            answer: extractValueOrThrow<number>(answer, {}, 'answer'),
          }
        }
        if (type === 'RANGE') {
          additional = {
            answer: extractValueOrThrow<number>(answer, {}, 'answer'),
          }
        }
        if (type === 'TRUE_FALSE') {
          additional = {
            answer: extractValueOrThrow<boolean>(answer, {}, 'answer'),
          }
        }
        if (type === 'TYPE_ANSWER') {
          additional = {
            answer: extractValueOrThrow<string>(answer, {}, 'answer'),
          }
        }
        return {
          type,
          playerId: overridePlayerId(
            extractValueOrThrow<string>(answer, {}, 'playerId'),
          ),
          created: toDate(extractValueOrThrow<string>(answer, {}, 'created')),
          ...additional,
        }
      })(extractValue<BSONDocument>(item, {}, 'answer'))

      const playerId = overridePlayerId(
        extractValueOrThrow<string>(item, {}, 'playerId'),
      )

      return {
        type: extractValueOrThrow<string>(item, {}, 'type'),
        playerId,
        nickname:
          extractValue<string>(item, {}, 'nickname') ||
          extractFallbackNickname(playerId),
        answer,
        correct: extractValueOrThrow<boolean>(item, {}, 'correct'),
        lastScore: extractValueOrThrow<number>(item, {}, 'lastScore'),
        totalScore: extractValueOrThrow<number>(item, {}, 'totalScore'),
        position: extractValueOrThrow<number>(item, {}, 'position'),
        streak: extractValueOrThrow<number>(item, {}, 'streak'),
      }
    },
  )
}

/**
 * Reads the raw leaderboard array from a task and applies ID overrides.
 *
 * @param task - LEADERBOARD or PODIUM task.
 * @returns Array of leaderboard items with normalized player IDs.
 */
function buildGameLeaderboard(task: BSONDocument): Array<BSONDocument> {
  return extractValueOrThrow<Array<BSONDocument>>(task, {}, 'leaderboard').map(
    buildGameLeaderboardTaskItem,
  )
}

/**
 * Formats a single leaderboard entry, applying `overridePlayerId`.
 *
 * @param leaderboardTaskItem - Raw item from the leaderboard array.
 * @returns Typed item with `playerId`, `position`, `nickname`, `score`, `streaks`.
 */
function buildGameLeaderboardTaskItem(
  leaderboardTaskItem: BSONDocument,
): BSONDocument {
  return {
    playerId: overridePlayerId(
      extractValueOrThrow<string>(leaderboardTaskItem, {}, 'playerId'),
    ),
    position: extractValueOrThrow<number>(leaderboardTaskItem, {}, 'position'),
    nickname: extractValueOrThrow<string>(leaderboardTaskItem, {}, 'nickname'),
    score: extractValueOrThrow<number>(leaderboardTaskItem, {}, 'score'),
    streaks: extractValueOrThrow<number>(leaderboardTaskItem, {}, 'streaks'),
  }
}
