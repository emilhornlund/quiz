import {
  GameMode,
  GameParticipantType,
  GameStatus,
  LanguageCode,
  MediaType,
  QuestionPinTolerance,
  QuestionRangeAnswerMargin,
  QuestionType,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseTask,
  Game,
  GameResult,
  LeaderboardTask,
  LeaderboardTaskItem,
  ParticipantBase,
  ParticipantHost,
  ParticipantPlayer,
  PlayerMetric,
  PodiumTask,
  QuestionResultTask,
  QuestionResultTaskBaseCorrectAnswer,
  QuestionResultTaskCorrectPinAnswer,
  QuestionResultTaskItem,
  QuestionTask,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskPinAnswer,
  QuestionTaskPuzzleAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  QuitTask,
  TaskType,
} from '../../src/game/repositories/models/schemas'
import { buildLobbyTask } from '../../src/game/services/utils'
import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionPinDao,
  QuestionPuzzleDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
  Quiz,
} from '../../src/quiz/repositories/models/schemas'
import { User } from '../../src/user/repositories'

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
    participantId: MOCK_DEFAULT_PLAYER_ID,
    type: GameParticipantType.HOST,
    updated: offsetSeconds(0),
    created: offsetSeconds(0),
    ...(participant ?? {}),
  }
}

export function createMockGamePlayerParticipantDocument(
  participant?: Partial<ParticipantBase & ParticipantPlayer>,
): ParticipantBase & ParticipantPlayer {
  return {
    participantId: MOCK_DEFAULT_PLAYER_ID,
    type: GameParticipantType.PLAYER,
    nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
    rank: 0,
    totalScore: 0,
    currentStreak: 0,
    updated: offsetSeconds(0),
    created: offsetSeconds(0),
    ...(participant ?? {}),
  }
}

export const MOCK_DEFAULT_PLAYER_ID = uuidv4()
export const MOCK_DEFAULT_PLAYER_NICKNAME = 'FrostyBear'

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

export function createMockPinQuestionDocument(
  question?: Partial<BaseQuestionDao & QuestionPinDao>,
): BaseQuestionDao & QuestionPinDao {
  return {
    type: QuestionType.Pin,
    text: 'Where is the Eiffel Tower located in Paris? Pin the answer on a map of Paris',
    imageURL: 'https://example.com/question-image.png',
    positionX: 0.5,
    positionY: 0.5,
    tolerance: QuestionPinTolerance.Medium,
    points: 1000,
    duration: 5,
    ...(question ?? {}),
  }
}

export function createMockPuzzleQuestionDocument(
  question?: Partial<BaseQuestionDao & QuestionPuzzleDao>,
): BaseQuestionDao & QuestionPuzzleDao {
  return {
    type: QuestionType.Puzzle,
    text: 'Sort the oldest cities in Europe',
    media: {
      type: MediaType.Image,
      url: 'https://example.com/question-image.png',
    },
    values: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
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
    metadata: {
      type: QuestionType.MultiChoice,
    },
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

export function createMockQuestionTaskPinAnswer(
  answer?: Partial<QuestionTaskBaseAnswer & QuestionTaskPinAnswer>,
): QuestionTaskBaseAnswer & QuestionTaskPinAnswer {
  return {
    type: QuestionType.Pin,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    answer: '0.5,0.5',
    created: offsetSeconds(0),
    ...(answer ?? {}),
  }
}

export function createMockQuestionResultTaskCorrectPinAnswer(
  answer?: Partial<
    QuestionResultTaskBaseCorrectAnswer & QuestionResultTaskCorrectPinAnswer
  >,
): QuestionResultTaskBaseCorrectAnswer & QuestionResultTaskCorrectPinAnswer {
  return {
    type: QuestionType.Pin,
    value: '0.5,0.5',
    ...(answer ?? {}),
  }
}

export function createMockQuestionTaskPuzzleAnswer(
  answer?: Partial<QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer>,
): QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer {
  return {
    type: QuestionType.Puzzle,
    playerId: MOCK_DEFAULT_PLAYER_ID,
    answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
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

export function createMockGameResultDocument(
  gameResult?: Partial<GameResult>,
): GameResult {
  return {
    _id: uuidv4(),
    game: { _id: uuidv4() } as Game,
    name: 'Trivia Battle',
    hostParticipantId: MOCK_DEFAULT_PLAYER_ID,
    players: [],
    questions: [],
    hosted: new Date(),
    completed: new Date(),
    ...(gameResult ?? {}),
  }
}

export function createMockGameResultPlayerMetric(
  playerMetric?: Partial<PlayerMetric>,
): PlayerMetric {
  return {
    participantId: MOCK_DEFAULT_PLAYER_ID,
    nickname: MOCK_DEFAULT_PLAYER_NICKNAME,
    rank: 0,
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    averageResponseTime: 0,
    longestCorrectStreak: 0,
    score: 0,
    ...(playerMetric ?? {}),
  }
}

export function createMockClassicQuiz(quiz?: Partial<Quiz>): Quiz {
  return {
    _id: uuidv4(),
    title: 'Trivia Battle',
    description: 'A fun and engaging trivia quiz for all ages.',
    mode: GameMode.Classic,
    visibility: QuizVisibility.Public,
    category: QuizCategory.GeneralKnowledge,
    imageCoverURL: 'https://example.com/question-cover-image.png',
    languageCode: LanguageCode.English,
    questions: [
      {
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
            value: 'Copenhagen',
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
        duration: 30,
      },
      {
        type: QuestionType.Range,
        text: 'Guess the temperature of the hottest day ever recorded.',
        media: {
          type: MediaType.Image,
          url: 'https://example.com/question-image.png',
        },
        min: 0,
        max: 100,
        step: 0,
        correct: 50,
        margin: QuestionRangeAnswerMargin.Medium,
        points: 1000,
        duration: 30,
      },
      {
        type: QuestionType.TrueFalse,
        text: 'The earth is flat.',
        media: {
          type: MediaType.Image,
          url: 'https://example.com/question-image.png',
        },
        correct: false,
        points: 1000,
        duration: 30,
      },
      {
        type: QuestionType.TypeAnswer,
        text: 'What is the capital of Denmark?',
        media: {
          type: MediaType.Image,
          url: 'https://example.com/question-image.png',
        },
        options: ['Copenhagen'],
        points: 1000,
        duration: 30,
      },
    ],
    owner: { _id: uuidv4() } as User,
    created: new Date(),
    updated: new Date(),
    ...(quiz ?? {}),
  }
}
