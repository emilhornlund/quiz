import {
  GameMode,
  GameParticipantType,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockPinQuestionDocument,
  createMockPuzzleQuestionDocument,
  createMockQuestionTaskPinAnswer,
  createMockQuestionTaskPuzzleAnswer,
} from '../../../../test-utils/data'
import { QuestionDao } from '../../../quiz/repositories/models/schemas'
import {
  GameDocument,
  QuestionTaskAnswer,
  TaskType,
} from '../../repositories/models/schemas'

import { buildQuestionResultTask } from './task.converter'

describe('TaskConverter', () => {
  describe('buildQuestionResultTask', () => {
    it('should build a question result task item for a classic mode game when question type is multi choice', () => {
      const gameDocument = buildGameDocument(
        [
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
        [
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: 0,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: 1,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_03,
            created: offset(5),
            answer: 2,
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.MultiChoice, index: 0 }],
        results: [
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: 0,
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.MultiChoice,
            },
            correct: true,
            lastScore: 900,
            totalScore: 900,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: 1,
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.MultiChoice,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.MultiChoice,
            playerId: PARTICIPANT_PLAYER_ID_03,
            answer: {
              answer: 2,
              created: offset(5),
              playerId: PARTICIPANT_PLAYER_ID_03,
              type: QuestionType.MultiChoice,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is range', () => {
      const gameDocument = buildGameDocument(
        [
          {
            type: QuestionType.Range,
            text: 'Guess the temperature of the hottest day ever recorded.',
            media: {
              type: MediaType.Image,
              url: 'https://example.com/question-image.png',
            },
            min: 0,
            max: 100,
            margin: QuestionRangeAnswerMargin.Medium,
            step: 2,
            correct: 50,
            points: 1000,
            duration: 30,
          },
        ],
        [
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: 50,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: 39,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_03,
            created: offset(5),
            answer: 61,
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.Range, value: 50 }],
        results: [
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: 50,
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.Range,
            },
            correct: true,
            lastScore: 997,
            totalScore: 997,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: 39,
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.Range,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.Range,
            playerId: PARTICIPANT_PLAYER_ID_03,
            answer: {
              answer: 61,
              created: offset(5),
              playerId: PARTICIPANT_PLAYER_ID_03,
              type: QuestionType.Range,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is true false', () => {
      const gameDocument = buildGameDocument(
        [
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
        ],
        [
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: false,
          },
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: true,
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.TrueFalse, value: false }],
        results: [
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: false,
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.TrueFalse,
            },
            correct: true,
            lastScore: 983,
            totalScore: 983,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: true,
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.TrueFalse,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.TrueFalse,
            playerId: PARTICIPANT_PLAYER_ID_03,
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is type answer', () => {
      const gameDocument = buildGameDocument(
        [
          {
            type: QuestionType.TypeAnswer,
            text: 'What is the capital of Sweden?',
            media: {
              type: MediaType.Image,
              url: 'https://example.com/question-image.png',
            },
            options: ['stockholm'],
            points: 1000,
            duration: 30,
          },
        ],
        [
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_01,
            created: offset(3),
            answer: 'stockholm',
          },
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_02,
            created: offset(4),
            answer: 'copenhagen',
          },
        ],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.TypeAnswer, value: 'stockholm' }],
        results: [
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              answer: 'stockholm',
              created: offset(3),
              playerId: PARTICIPANT_PLAYER_ID_01,
              type: QuestionType.TypeAnswer,
            },
            correct: true,
            lastScore: 983,
            totalScore: 983,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              answer: 'copenhagen',
              created: offset(4),
              playerId: PARTICIPANT_PLAYER_ID_02,
              type: QuestionType.TypeAnswer,
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.TypeAnswer,
            playerId: PARTICIPANT_PLAYER_ID_03,
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is pin', () => {
      const player1Answer = createMockQuestionTaskPinAnswer({
        playerId: PARTICIPANT_PLAYER_ID_01,
        created: offset(3),
        answer: '0.5,0.5',
      })
      const player2Answer = createMockQuestionTaskPinAnswer({
        playerId: PARTICIPANT_PLAYER_ID_02,
        created: offset(4),
        answer: '0.0,0.0',
      })

      const gameDocument = buildGameDocument(
        [createMockPinQuestionDocument()],
        [player1Answer, player2Answer],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [{ type: QuestionType.Pin, value: '0.5,0.5' }],
        results: [
          {
            type: QuestionType.Pin,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: '0.5,0.5',
              created: offset(3),
            },
            correct: true,
            lastScore: 980,
            totalScore: 980,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.Pin,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: '0.0,0.0',
              created: offset(4),
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.Pin,
            playerId: PARTICIPANT_PLAYER_ID_03,
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })

    it('should build a question result task item for a classic mode game when question type is puzzle', () => {
      const player1Answer = createMockQuestionTaskPuzzleAnswer({
        playerId: PARTICIPANT_PLAYER_ID_01,
        created: offset(3),
        answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      })
      const player2Answer = createMockQuestionTaskPuzzleAnswer({
        playerId: PARTICIPANT_PLAYER_ID_02,
        created: offset(4),
        answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
      })

      const gameDocument = buildGameDocument(
        [createMockPuzzleQuestionDocument()],
        [player1Answer, player2Answer],
      )

      expect(buildQuestionResultTask(gameDocument)).toEqual({
        _id: expect.anything(),
        type: TaskType.QuestionResult,
        status: 'pending',
        questionIndex: 0,
        correctAnswers: [
          {
            type: QuestionType.Puzzle,
            value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
          },
        ],
        results: [
          {
            type: QuestionType.Puzzle,
            playerId: PARTICIPANT_PLAYER_ID_01,
            answer: {
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
              created: offset(3),
            },
            correct: true,
            lastScore: 983,
            totalScore: 983,
            position: 1,
            streak: 1,
          },
          {
            type: QuestionType.Puzzle,
            playerId: PARTICIPANT_PLAYER_ID_02,
            answer: {
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
              created: offset(4),
            },
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 2,
            streak: 0,
          },
          {
            type: QuestionType.Puzzle,
            playerId: PARTICIPANT_PLAYER_ID_03,
            correct: false,
            lastScore: 0,
            totalScore: 0,
            position: 3,
            streak: 0,
          },
        ],
        created: expect.anything(),
      })
    })
  })
})

const date = new Date('2025-04-09T14:43:03.687Z')
const offset = (seconds: number) => new Date(date.getTime() + seconds * 1000)

const PARTICIPANT_PLAYER_ID_01 = uuidv4()
const PARTICIPANT_PLAYER_ID_02 = uuidv4()
const PARTICIPANT_PLAYER_ID_03 = uuidv4()

function buildGameDocument(
  questions: QuestionDao[],
  answers: QuestionTaskAnswer[],
): GameDocument {
  return {
    _id: uuidv4(),
    name: 'Trivia Battle',
    mode: GameMode.Classic,
    pin: '123456',
    nextQuestion: 0,
    participants: [
      {
        participantId: uuidv4(),
        type: GameParticipantType.HOST,
      },
      {
        participantId: PARTICIPANT_PLAYER_ID_01,
        type: GameParticipantType.PLAYER,
        totalScore: 0,
        currentStreak: 0,
      },
      {
        participantId: PARTICIPANT_PLAYER_ID_02,
        type: GameParticipantType.PLAYER,
        totalScore: 0,
        currentStreak: 0,
      },
      {
        participantId: PARTICIPANT_PLAYER_ID_03,
        type: GameParticipantType.PLAYER,
        totalScore: 0,
        currentStreak: 0,
      },
    ],
    questions,
    currentTask: {
      _id: uuidv4(),
      type: TaskType.Question,
      status: 'active',
      questionIndex: 0,
      answers,
      presented: offset(2),
      created: offset(1),
    },
    previousTasks: [],
    created: offset(0),
  } as GameDocument
}
