import {
  GameMode,
  GameParticipantType,
  GameStatus,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

import { Client } from '../../src/client/services/models/schemas'
import {
  BaseTask,
  Game,
  LeaderboardTask,
  LeaderboardTaskItem,
  ParticipantBase,
  ParticipantHost,
  ParticipantPlayer,
  PodiumTask,
  QuestionResultTask,
  QuestionResultTaskItem,
  QuestionTask,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  QuitTask,
  TaskType,
} from '../../src/game/services/models/schemas'
import { buildLobbyTask } from '../../src/game/services/utils'
import { Player } from '../../src/player/services/models/schemas'
import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
  Quiz,
} from '../../src/quiz/services/models/schemas'

import { offsetSeconds } from './helpers.utils'

export function createMockGameDocument(game?: Partial<Game>): Game {
  return {
    _id: uuidv4(),
    name: 'Trivia Battle',
    mode: GameMode.Classic,
    status: GameStatus.Active,
    pin: '123456',
    quiz: { _id: uuidv4() } as Quiz, //TODO: build mock quiz
    questions: [],
    nextQuestion: 0,
    participants: [],
    currentTask: buildLobbyTask(),
    previousTasks: [],
    updated: offsetSeconds(0),
    created: offsetSeconds(0),
    ...(game ?? {}),
  }
}

export function createMockGameHostParticipantDocument(
  participant?: Partial<ParticipantBase & ParticipantHost>,
): ParticipantBase & ParticipantHost {
  return {
    type: GameParticipantType.HOST,
    player: createMockPlayerDocument(),
    updated: offsetSeconds(0),
    created: offsetSeconds(0),
    ...(participant ?? {}),
  }
}

export function createMockGamePlayerParticipantDocument(
  participant?: Partial<ParticipantBase & ParticipantPlayer>,
): ParticipantBase & ParticipantPlayer {
  return {
    type: GameParticipantType.PLAYER,
    player: createMockPlayerDocument(),
    nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
    rank: 0,
    totalScore: 0,
    currentStreak: 0,
    updated: offsetSeconds(0),
    created: offsetSeconds(0),
    ...(participant ?? {}),
  }
}

export function createMockClientDocument(client?: Partial<Client>): Client {
  const clientId = uuidv4()

  const salt = bcrypt.genSaltSync()
  const clientIdHash = bcrypt.hashSync(clientId, salt)

  return {
    _id: clientId,
    clientIdHash,
    player: createMockPlayerDocument(client?.player),
    created: offsetSeconds(0),
    modified: offsetSeconds(0),
    ...(client ?? {}),
  }
}

export const MOCK_DEFAULT_PLAYER_ID = uuidv4()
export const MOCK_DEFAULT_PLAYER_NICKNAME = 'FrostyBear'

export const MOCK_SECONDARY_PLAYER_NICKNAME = 'WhiskerFox'

export function createMockPlayerDocument(player?: Partial<Player>): Player {
  return {
    _id: MOCK_DEFAULT_PLAYER_ID,
    nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
    created: offsetSeconds(0),
    modified: offsetSeconds(0),
    ...(player ?? {}),
  }
}

export function createMockMultiChoiceQuestionDocument(
  question?: Partial<BaseQuestionDao & QuestionMultiChoiceDao>,
): QuestionDao {
  return {
    type: QuestionType.MultiChoice,
    text: 'What is the capital of Sweden?',
    media: {
      type: MediaType.Image,
      url: 'https://example.com/question-image.png',
    },
    options: [
      {
        value: 'Stockholm',
        correct: true,
      },
      {
        value: 'Paris',
        correct: false,
      },
      {
        value: 'London',
        correct: false,
      },
      {
        value: 'Berlin',
        correct: false,
      },
    ],
    points: 1000,
    duration: 5,
    ...(question ?? {}),
  }
}

export function createMockRangeQuestionDocument(
  question?: Partial<BaseQuestionDao & QuestionRangeDao>,
): QuestionDao {
  return {
    type: QuestionType.Range,
    text: 'Guess the temperature of the hottest day ever recorded.',
    media: {
      type: MediaType.Image,
      url: 'https://example.com/question-image.png',
    },
    min: 0,
    max: 100,
    margin: QuestionRangeAnswerMargin.Medium,
    step: 1,
    correct: 50,
    points: 1000,
    duration: 30,
    ...(question ?? {}),
  }
}

export function createMockTrueFalseQuestionDocument(
  question?: Partial<BaseQuestionDao & QuestionTrueFalseDao>,
): QuestionDao {
  return {
    type: QuestionType.TrueFalse,
    text: 'The earth is flat.',
    media: {
      type: MediaType.Image,
      url: 'https://example.com/question-image.png',
    },
    correct: false,
    points: 1000,
    duration: 30,
    ...(question ?? {}),
  }
}

export const MOCK_TYPE_ANSWER_OPTION_VALUE = 'copenhagen'
export const MOCK_TYPE_ANSWER_OPTION_VALUE_ALTERNATIVE = 'köpenhamn'
export const MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE = 'stockholm'

export function createMockTypeAnswerQuestionDocument(
  question?: Partial<BaseQuestionDao & QuestionTypeAnswerDao>,
): QuestionDao {
  return {
    type: QuestionType.TypeAnswer,
    text: 'What is the capital of Denmark?',
    media: {
      type: MediaType.Image,
      url: 'https://example.com/question-image.png',
    },
    options: [MOCK_TYPE_ANSWER_OPTION_VALUE],
    points: 1000,
    duration: 30,
    ...(question ?? {}),
  }
}

export function createMockQuestionTaskDocument(
  task?: Partial<BaseTask & QuestionTask>,
): BaseTask & QuestionTask {
  return {
    _id: uuidv4(),
    type: TaskType.Question,
    status: 'pending',
    questionIndex: 0,
    answers: [],
    presented: offsetSeconds(0),
    created: offsetSeconds(0),
    ...(task ?? {}),
  }
}

export function createMockQuestionResultTaskDocument(
  task?: Partial<BaseTask & QuestionResultTask>,
): BaseTask & QuestionResultTask {
  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'pending',
    questionIndex: 0,
    correctAnswers: [],
    results: [],
    created: offsetSeconds(0),
    ...(task ?? {}),
  }
}

export function createMockQuestionResultTaskItemDocument(
  taskItem?: Partial<QuestionResultTaskItem>,
): QuestionResultTaskItem {
  return {
    type: QuestionType.MultiChoice,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
    answer: createMockQuestionTaskMultiChoiceAnswer(),
    correct: true,
    lastScore: 1337,
    totalScore: 1337,
    position: 1,
    streak: 1,
    ...(taskItem ?? {}),
  }
}

export function createMockQuestionTaskMultiChoiceAnswer(
  answer?: Partial<QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer>,
): QuestionTaskBaseAnswer & QuestionTaskMultiChoiceAnswer {
  return {
    type: QuestionType.MultiChoice,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    answer: 0,
    created: offsetSeconds(0),
    ...(answer ?? {}),
  }
}

export function createMockQuestionTaskRangeAnswer(
  answer?: Partial<QuestionTaskBaseAnswer & QuestionTaskRangeAnswer>,
): QuestionTaskBaseAnswer & QuestionTaskRangeAnswer {
  return {
    type: QuestionType.Range,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    answer: 0,
    created: offsetSeconds(0),
    ...(answer ?? {}),
  }
}

export function createMockQuestionTaskTrueFalseAnswer(
  answer?: Partial<QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer>,
): QuestionTaskBaseAnswer & QuestionTaskTrueFalseAnswer {
  return {
    type: QuestionType.TrueFalse,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    answer: true,
    created: offsetSeconds(0),
    ...(answer ?? {}),
  }
}

export function createMockQuestionTaskTypeAnswer(
  answer?: Partial<QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer>,
): QuestionTaskBaseAnswer & QuestionTaskTypeAnswerAnswer {
  return {
    type: QuestionType.TypeAnswer,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
    created: offsetSeconds(0),
    ...(answer ?? {}),
  }
}

export function createMockLeaderboardTaskItem(
  item?: Partial<LeaderboardTaskItem>,
): LeaderboardTaskItem {
  return {
    playerId: MOCK_DEFAULT_PLAYER_ID,
    position: 1,
    nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
    score: 1337,
    streaks: 3,
    ...(item ?? {}),
  }
}

export function createMockLeaderboardTaskDocument(
  task?: Partial<BaseTask & LeaderboardTask>,
): BaseTask & LeaderboardTask {
  return {
    _id: uuidv4(),
    type: TaskType.Leaderboard,
    status: 'pending',
    questionIndex: 1,
    leaderboard: [],
    created: new Date(),
    ...(task ?? {}),
  }
}

export function createMockPodiumTaskDocument(
  task?: Partial<BaseTask & PodiumTask>,
): BaseTask & PodiumTask {
  return {
    _id: uuidv4(),
    type: TaskType.Podium,
    status: 'pending',
    leaderboard: [],
    created: offsetSeconds(0),
    ...(task ?? {}),
  }
}

export function createMockQuitTaskDocument(
  task?: Partial<BaseTask & QuitTask>,
): BaseTask & QuitTask {
  return {
    _id: uuidv4(),
    type: TaskType.Quit,
    status: 'completed',
    created: offsetSeconds(0),
    ...(task ?? {}),
  }
}

export const MOCK_DEFAULT_USER_EMAIL = 'user@example.com'
export const MOCK_DEFAULT_USER_PASSWORD = '%AD2W!o#iGPoa7wd'
export const MOCK_DEFAULT_USER_GIVEN_NAME = 'John'
export const MOCK_DEFAULT_USER_FAMILY_NAME = 'Appleseed'
