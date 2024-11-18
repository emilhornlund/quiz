import {
  GameEventType,
  GameMode,
  GameResultHostEvent,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  BaseTask,
  GameDocument,
  Player,
  QuestionResultTask,
  QuestionResultTaskItem,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  TaskType,
} from '../models/schemas'

import { buildHostGameEvent } from './game-event.converter'

describe('Game Event Converter', () => {
  describe('buildHostGameEvent', () => {
    describe('for task type QuestionResult', () => {
      describe('for status active', () => {
        it('should correctly aggregate answer distribution for MultiChoice questions', () => {
          const gameDocument: GameDocument = buildGameDocument(
            [
              {
                type: QuestionType.MultiChoice,
                question: 'What is the capital of Sweden?',
                imageURL: 'https://example.com/question-image.png',
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
              },
            ],
            buildQuestionResultTask([
              buildQuestionResultTaskItem(
                QuestionType.MultiChoice,
                PLAYER_01,
                true,
                1,
                0,
              ),
              buildQuestionResultTaskItem(
                QuestionType.MultiChoice,
                PLAYER_02,
                true,
                1,
                0,
              ),
              buildQuestionResultTaskItem(
                QuestionType.MultiChoice,
                PLAYER_03,
                false,
                1,
                1,
              ),
            ]),
          )

          const actual = buildHostGameEvent(gameDocument) as GameResultHostEvent

          const expected: GameResultHostEvent = {
            type: GameEventType.GameResultHost,
            game: {
              pin: gameDocument.pin,
            },
            question: {
              type: gameDocument.questions[0].type,
              question: gameDocument.questions[0].question,
            },
            results: {
              type: QuestionType.MultiChoice,
              distribution: [
                {
                  value: 'Stockholm',
                  count: 2,
                  correct: true,
                },
                {
                  value: 'Paris',
                  count: 1,
                  correct: false,
                },
              ],
            },
            pagination: {
              current: 1,
              total: 1,
            },
          }

          expect(actual).toEqual(expected)
        })

        it('should correctly aggregate answer distribution for Range questions', () => {
          const gameDocument: GameDocument = buildGameDocument(
            [
              {
                type: QuestionType.Range,
                question:
                  'Guess the temperature of the hottest day ever recorded.',
                imageURL: 'https://example.com/question-image.png',
                min: 0,
                max: 100,
                correct: 50,
                points: 1000,
                duration: 30,
              },
            ],
            buildQuestionResultTask([
              buildQuestionResultTaskItem(
                QuestionType.Range,
                PLAYER_01,
                true,
                1,
                50,
              ),
              buildQuestionResultTaskItem(
                QuestionType.Range,
                PLAYER_02,
                true,
                1,
                50,
              ),
              buildQuestionResultTaskItem(
                QuestionType.Range,
                PLAYER_03,
                false,
                1,
                45,
              ),
            ]),
          )

          const actual = buildHostGameEvent(gameDocument) as GameResultHostEvent

          const expected: GameResultHostEvent = {
            type: GameEventType.GameResultHost,
            game: {
              pin: gameDocument.pin,
            },
            question: {
              type: gameDocument.questions[0].type,
              question: gameDocument.questions[0].question,
            },
            results: {
              type: QuestionType.Range,
              distribution: [
                {
                  value: 50,
                  count: 2,
                  correct: true,
                },
                {
                  value: 45,
                  count: 1,
                  correct: false,
                },
              ],
            },
            pagination: {
              current: 1,
              total: 1,
            },
          }

          expect(actual).toEqual(expected)
        })

        it('should correctly aggregate answer distribution for TrueFalse questions', () => {
          const gameDocument: GameDocument = buildGameDocument(
            [
              {
                type: QuestionType.TrueFalse,
                question: 'The earth is flat.',
                imageURL: 'https://example.com/question-image.png',
                correct: false,
                points: 1000,
                duration: 30,
              },
            ],
            buildQuestionResultTask([
              buildQuestionResultTaskItem(
                QuestionType.TrueFalse,
                PLAYER_01,
                true,
                1,
                false,
              ),
              buildQuestionResultTaskItem(
                QuestionType.TrueFalse,
                PLAYER_02,
                true,
                1,
                false,
              ),
              buildQuestionResultTaskItem(
                QuestionType.TrueFalse,
                PLAYER_03,
                false,
                1,
                true,
              ),
            ]),
          )

          const actual = buildHostGameEvent(gameDocument) as GameResultHostEvent

          const expected: GameResultHostEvent = {
            type: GameEventType.GameResultHost,
            game: {
              pin: gameDocument.pin,
            },
            question: {
              type: gameDocument.questions[0].type,
              question: gameDocument.questions[0].question,
            },
            results: {
              type: QuestionType.TrueFalse,
              distribution: [
                {
                  value: false,
                  count: 2,
                  correct: true,
                },
                {
                  value: true,
                  count: 1,
                  correct: false,
                },
              ],
            },
            pagination: {
              current: 1,
              total: 1,
            },
          }

          expect(actual).toEqual(expected)
        })

        it('should correctly aggregate answer distribution for TypeAnswer questions', () => {
          const gameDocument: GameDocument = buildGameDocument(
            [
              {
                type: QuestionType.TypeAnswer,
                question: 'What is the capital of Sweden?',
                imageURL: 'https://example.com/question-image.png',
                correct: 'Stockholm',
                points: 1000,
                duration: 30,
              },
            ],
            buildQuestionResultTask([
              buildQuestionResultTaskItem(
                QuestionType.TypeAnswer,
                PLAYER_01,
                true,
                1,
                'Stockholm',
              ),
              buildQuestionResultTaskItem(
                QuestionType.TypeAnswer,
                PLAYER_02,
                true,
                1,
                'Stockholm',
              ),
              buildQuestionResultTaskItem(
                QuestionType.TypeAnswer,
                PLAYER_03,
                false,
                1,
                'Copenhagen',
              ),
            ]),
          )

          const actual = buildHostGameEvent(gameDocument) as GameResultHostEvent

          const expected: GameResultHostEvent = {
            type: GameEventType.GameResultHost,
            game: {
              pin: gameDocument.pin,
            },
            question: {
              type: gameDocument.questions[0].type,
              question: gameDocument.questions[0].question,
            },
            results: {
              type: QuestionType.TypeAnswer,
              distribution: [
                {
                  value: 'stockholm',
                  count: 2,
                  correct: true,
                },
                {
                  value: 'copenhagen',
                  count: 1,
                  correct: false,
                },
              ],
            },
            pagination: {
              current: 1,
              total: 1,
            },
          }

          expect(actual).toEqual(expected)
        })
      })
    })
  })
})

const PLAYER_01: Player = {
  _id: uuidv4(),
  nickname: 'ShadowCyborg',
  totalScore: 18456,
  currentStreak: 2,
  joined: new Date(),
}

const PLAYER_02: Player = {
  _id: uuidv4(),
  nickname: 'Radar',
  totalScore: 18398,
  currentStreak: 0,
  joined: new Date(),
}

const PLAYER_03: Player = {
  _id: uuidv4(),
  nickname: 'ShadowWhirlwind',
  totalScore: 15492,
  currentStreak: 0,
  joined: new Date(),
}

function buildGameDocument(
  questions: GameDocument['questions'],
  currentTask: GameDocument['currentTask'],
): GameDocument {
  return {
    _id: uuidv4(),
    name: 'Trivia Battle',
    mode: GameMode.Classic,
    pin: '123456',
    nextQuestion: 0,
    hostClientId: uuidv4(),
    players: [],
    questions,
    currentTask,
    previousTasks: [],
    expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
    created: new Date(Date.now()),
  } as GameDocument
}

function buildQuestionResultTask(
  results: QuestionResultTaskItem[],
): BaseTask & QuestionResultTask {
  return {
    _id: uuidv4(),
    type: TaskType.QuestionResult,
    status: 'active',
    questionIndex: 0,
    results,
    created: new Date(),
  }
}

function buildQuestionResultTaskItem(
  type: QuestionType,
  player: Player,
  correct: boolean,
  position: number,
  answer: (
    | QuestionTaskMultiChoiceAnswer
    | QuestionTaskRangeAnswer
    | QuestionTaskTrueFalseAnswer
    | QuestionTaskTypeAnswerAnswer
  )['answer'],
): QuestionResultTaskItem {
  return {
    type,
    playerId: player._id,
    answer: {
      type,
      playerId: player._id,
      answer,
      created: new Date(),
    },
    correct,
    lastScore: correct ? 1000 : 0,
    totalScore: player.totalScore,
    position: position,
    streak: player.currentStreak,
  }
}
