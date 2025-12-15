import { GameMode, QuestionType } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  createMockGameDocument,
  createMockGameHostParticipantDocument,
  createMockGamePlayerParticipantDocument,
  createMockLeaderboardTaskDocument,
  createMockMultiChoiceQuestionDocument,
  createMockPinQuestionDocument,
  createMockPodiumTaskDocument,
  createMockPuzzleQuestionDocument,
  createMockQuestionResultTaskCorrectMultiChoice,
  createMockQuestionResultTaskCorrectPinAnswer,
  createMockQuestionResultTaskCorrectPuzzleAnswer,
  createMockQuestionResultTaskCorrectRange,
  createMockQuestionResultTaskCorrectTrueFalse,
  createMockQuestionResultTaskCorrectTypeAnswer,
  createMockQuestionResultTaskDocument,
  createMockQuestionResultTaskItemDocument,
  createMockQuestionTaskDocument,
  createMockQuestionTaskMultiChoiceAnswer,
  createMockQuestionTaskPinAnswer,
  createMockQuestionTaskPuzzleAnswer,
  createMockQuestionTaskRangeAnswer,
  createMockQuestionTaskTrueFalseAnswer,
  createMockQuestionTaskTypeAnswer,
  createMockRangeQuestionDocument,
  createMockTrueFalseQuestionDocument,
  createMockTypeAnswerQuestionDocument,
  MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
  MOCK_TYPE_ANSWER_OPTION_VALUE,
  offsetSeconds,
} from '../../../../../../test-utils/data'
import { IllegalTaskTypeException } from '../../../exceptions'
import { TaskType } from '../../../repositories/models/schemas'

import {
  buildQuestionResultTask,
  findLastQuestionResultTask,
  findPreviousQuestionResultForPlayer,
  findQuestionResultForPlayer,
  rebuildQuestionResultTask,
} from './task-question-result.utils'

describe('Task Question Result Utils', () => {
  const PARTICIPANT_PLAYER_ID_01 = uuidv4()
  const PARTICIPANT_PLAYER_ID_02 = uuidv4()
  const PARTICIPANT_PLAYER_ID_03 = uuidv4()
  describe('findQuestionResultForPlayer', () => {
    it('returns the matching result entry for the given player', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const expectedResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [expectedResult],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBe(expectedResult)
    })

    it('returns the correct result when multiple results exist', () => {
      const playerId = uuidv4()
      const otherPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const otherResult = createMockQuestionResultTaskItemDocument({
        playerId: otherPlayerId,
      })
      const expectedResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })
      const anotherResult = createMockQuestionResultTaskItemDocument({
        playerId: uuidv4(),
      })

      const task = createMockQuestionResultTaskDocument({
        results: [otherResult, expectedResult, anotherResult],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBe(expectedResult)
    })

    it('returns null when there is no result entry for the player', () => {
      const playerId = uuidv4()
      const otherPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [
          createMockQuestionResultTaskItemDocument({
            playerId: otherPlayerId,
          }),
        ],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })

    it('returns null when the results list is empty', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [],
      })

      const result = findQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })
  })

  describe('findPreviousQuestionResultForPlayer', () => {
    it('returns the previous result entry when the player is not first in the list', () => {
      const playerId = uuidv4()
      const previousPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const previousResult = createMockQuestionResultTaskItemDocument({
        playerId: previousPlayerId,
      })
      const currentResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [previousResult, currentResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBe(previousResult)
    })

    it('returns the immediate previous result when there are multiple earlier entries', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const firstResult = createMockQuestionResultTaskItemDocument({
        playerId: uuidv4(),
      })
      const secondResult = createMockQuestionResultTaskItemDocument({
        playerId: uuidv4(),
      })
      const currentResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [firstResult, secondResult, currentResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBe(secondResult)
    })

    it('returns null when the player is the first entry in the results list', () => {
      const playerId = uuidv4()
      const otherPlayerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const firstResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })
      const secondResult = createMockQuestionResultTaskItemDocument({
        playerId: otherPlayerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [firstResult, secondResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })

    it('returns null when there is no result entry for the player', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [
          createMockQuestionResultTaskItemDocument({
            playerId: uuidv4(),
          }),
          createMockQuestionResultTaskItemDocument({
            playerId: uuidv4(),
          }),
        ],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })

    it('returns null when the results list has fewer than two entries', () => {
      const playerId = uuidv4()

      const player = createMockGamePlayerParticipantDocument({
        participantId: playerId,
      })

      const onlyResult = createMockQuestionResultTaskItemDocument({
        playerId,
      })

      const task = createMockQuestionResultTaskDocument({
        results: [onlyResult],
      })

      const result = findPreviousQuestionResultForPlayer(task, player)

      expect(result).toBeNull()
    })
  })

  describe('findLastQuestionResultTask', () => {
    it('returns the current task when it is a QuestionResultTask', () => {
      const currentTask = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask,
        previousTasks: [
          createMockQuestionTaskDocument(),
          createMockLeaderboardTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(currentTask)
    })

    it('returns the last QuestionResult task from previousTasks when currentTask is not QuestionResult', () => {
      const expected = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument(),
        previousTasks: [
          createMockQuestionResultTaskDocument(),
          createMockLeaderboardTaskDocument(),
          createMockQuestionTaskDocument(),
          expected,
          createMockPodiumTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(expected)
      expect(result?.type).toBe(TaskType.QuestionResult)
    })

    it('prefers current QuestionResult task over any previous QuestionResult tasks', () => {
      const previousQuestionResult = createMockQuestionResultTaskDocument()
      const currentTask = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask,
        previousTasks: [
          createMockQuestionTaskDocument(),
          previousQuestionResult,
          createMockLeaderboardTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(currentTask)
    })

    it('returns null when neither currentTask nor previousTasks contain a QuestionResult task', () => {
      const game = createMockGameDocument({
        currentTask: createMockQuestionTaskDocument(),
        previousTasks: [
          createMockLeaderboardTaskDocument(),
          createMockPodiumTaskDocument(),
        ],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBeNull()
    })

    it('returns null when previousTasks is empty and currentTask is not a QuestionResult task', () => {
      const game = createMockGameDocument({
        currentTask: createMockLeaderboardTaskDocument(),
        previousTasks: [],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBeNull()
    })

    it('returns the only QuestionResult task in previousTasks when currentTask is not QuestionResult', () => {
      const expected = createMockQuestionResultTaskDocument()

      const game = createMockGameDocument({
        currentTask: createMockPodiumTaskDocument(),
        previousTasks: [expected],
      })

      const result = findLastQuestionResultTask(game as never)

      expect(result).toBe(expected)
    })

    it('does not mutate the order of previousTasks when searching for the last QuestionResult task', () => {
      const previousTasks = [
        createMockQuestionTaskDocument(),
        createMockQuestionResultTaskDocument(),
        createMockLeaderboardTaskDocument(),
        createMockQuestionResultTaskDocument(),
      ]

      const game = createMockGameDocument({
        currentTask: createMockPodiumTaskDocument(),
        previousTasks: [...previousTasks],
      })

      findLastQuestionResultTask(game as never)

      expect(game.previousTasks).toEqual(previousTasks)
    })
  })

  describe('buildQuestionResultTask', () => {
    describe('Basic functionality', () => {
      it('should build a question result task item for a classic mode game when question type is multi choice', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_03,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskMultiChoiceAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 0,
              }),
              createMockQuestionTaskMultiChoiceAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: 1,
              }),
            ],
            presented: offsetSeconds(2),
            created: offsetSeconds(1),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const expected = createMockQuestionResultTaskDocument({
          _id: expect.anything(),
          correctAnswers: [
            createMockQuestionResultTaskCorrectMultiChoice({ index: 0 }),
          ],
          results: [
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.MultiChoice,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: createMockQuestionTaskMultiChoiceAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                answer: 0,
                created: offsetSeconds(3),
              }),
              correct: true,
              lastScore: 900,
              totalScore: 900,
              position: 1,
              streak: 1,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.MultiChoice,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: createMockQuestionTaskMultiChoiceAnswer({
                answer: 1,
                created: offsetSeconds(4),
                playerId: PARTICIPANT_PLAYER_ID_02,
              }),
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 2,
              streak: 0,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.MultiChoice,
              playerId: PARTICIPANT_PLAYER_ID_03,
              answer: undefined,
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 3,
              streak: 0,
            }),
          ],
          created: expect.anything(),
        })

        expect(actual).toEqual(expected)
      })

      it('should build a question result task item for a classic mode game when question type is range', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_03,
            }),
          ],
          questions: [createMockRangeQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskRangeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 50,
              }),
              createMockQuestionTaskRangeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: 39,
              }),
            ],
            presented: offsetSeconds(2),
            created: offsetSeconds(1),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const expected = createMockQuestionResultTaskDocument({
          _id: expect.anything(),
          correctAnswers: [
            createMockQuestionResultTaskCorrectRange({ value: 50 }),
          ],
          results: [
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Range,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: createMockQuestionTaskRangeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                answer: 50,
                created: offsetSeconds(3),
              }),
              correct: true,
              lastScore: 997,
              totalScore: 997,
              position: 1,
              streak: 1,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Range,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: createMockQuestionTaskRangeAnswer({
                answer: 39,
                created: offsetSeconds(4),
                playerId: PARTICIPANT_PLAYER_ID_02,
              }),
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 2,
              streak: 0,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Range,
              playerId: PARTICIPANT_PLAYER_ID_03,
              answer: undefined,
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 3,
              streak: 0,
            }),
          ],
          created: expect.anything(),
        })

        expect(actual).toEqual(expected)
      })

      it('should build a question result task item for a classic mode game when question type is true false', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_03,
            }),
          ],
          questions: [createMockTrueFalseQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskTrueFalseAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: false,
              }),
              createMockQuestionTaskTrueFalseAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: true,
              }),
            ],
            presented: offsetSeconds(2),
            created: offsetSeconds(1),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const expected = createMockQuestionResultTaskDocument({
          _id: expect.anything(),
          correctAnswers: [
            createMockQuestionResultTaskCorrectTrueFalse({ value: false }),
          ],
          results: [
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.TrueFalse,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: createMockQuestionTaskTrueFalseAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                answer: false,
                created: offsetSeconds(3),
              }),
              correct: true,
              lastScore: 983,
              totalScore: 983,
              position: 1,
              streak: 1,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.TrueFalse,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: createMockQuestionTaskTrueFalseAnswer({
                answer: true,
                created: offsetSeconds(4),
                playerId: PARTICIPANT_PLAYER_ID_02,
              }),
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 2,
              streak: 0,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.TrueFalse,
              playerId: PARTICIPANT_PLAYER_ID_03,
              answer: undefined,
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 3,
              streak: 0,
            }),
          ],
          created: expect.anything(),
        })

        expect(actual).toEqual(expected)
      })

      it('should build a question result task item for a classic mode game when question type is type answer', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_03,
            }),
          ],
          questions: [createMockTypeAnswerQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskTypeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
              }),
              createMockQuestionTaskTypeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
              }),
            ],
            presented: offsetSeconds(2),
            created: offsetSeconds(1),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const expected = createMockQuestionResultTaskDocument({
          _id: expect.anything(),
          correctAnswers: [
            createMockQuestionResultTaskCorrectTypeAnswer({
              value: MOCK_TYPE_ANSWER_OPTION_VALUE,
            }),
          ],
          results: [
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.TypeAnswer,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: createMockQuestionTaskTypeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
                created: offsetSeconds(3),
              }),
              correct: true,
              lastScore: 983,
              totalScore: 983,
              position: 1,
              streak: 1,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.TypeAnswer,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: createMockQuestionTaskTypeAnswer({
                answer: MOCK_TYPE_ANSWER_INCORRECT_OPTION_VALUE,
                created: offsetSeconds(4),
                playerId: PARTICIPANT_PLAYER_ID_02,
              }),
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 2,
              streak: 0,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.TypeAnswer,
              playerId: PARTICIPANT_PLAYER_ID_03,
              answer: undefined,
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 3,
              streak: 0,
            }),
          ],
          created: expect.anything(),
        })

        expect(actual).toEqual(expected)
      })

      it('should build a question result task item for a classic mode game when question type is pin', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_03,
            }),
          ],
          questions: [createMockPinQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskPinAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: '0.5,0.5',
              }),
              createMockQuestionTaskPinAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: '0.0,0.0',
              }),
            ],
            presented: offsetSeconds(2),
            created: offsetSeconds(1),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const expected = createMockQuestionResultTaskDocument({
          _id: expect.anything(),
          correctAnswers: [
            createMockQuestionResultTaskCorrectPinAnswer({ value: '0.5,0.5' }),
          ],
          results: [
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: createMockQuestionTaskPinAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                answer: '0.5,0.5',
                created: offsetSeconds(3),
              }),
              correct: true,
              lastScore: 980,
              totalScore: 980,
              position: 1,
              streak: 1,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: createMockQuestionTaskPinAnswer({
                answer: '0.0,0.0',
                created: offsetSeconds(4),
                playerId: PARTICIPANT_PLAYER_ID_02,
              }),
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 2,
              streak: 0,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Pin,
              playerId: PARTICIPANT_PLAYER_ID_03,
              answer: undefined,
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 3,
              streak: 0,
            }),
          ],
          created: expect.anything(),
        })

        expect(actual).toEqual(expected)
      })

      it('should build a question result task item for a classic mode game when question type is puzzle', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_03,
            }),
          ],
          questions: [createMockPuzzleQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskPuzzleAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
              }),
              createMockQuestionTaskPuzzleAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
              }),
            ],
            presented: offsetSeconds(2),
            created: offsetSeconds(1),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const expected = createMockQuestionResultTaskDocument({
          _id: expect.anything(),
          correctAnswers: [
            createMockQuestionResultTaskCorrectPuzzleAnswer({
              value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
            }),
          ],
          results: [
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_01,
              answer: createMockQuestionTaskPuzzleAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
                created: offsetSeconds(3),
              }),
              correct: true,
              lastScore: 983,
              totalScore: 983,
              position: 1,
              streak: 1,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_02,
              answer: createMockQuestionTaskPuzzleAnswer({
                answer: ['Lisbon', 'Plovdiv', 'Argos', 'Athens'],
                created: offsetSeconds(4),
                playerId: PARTICIPANT_PLAYER_ID_02,
              }),
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 2,
              streak: 0,
            }),
            createMockQuestionResultTaskItemDocument({
              type: QuestionType.Puzzle,
              playerId: PARTICIPANT_PLAYER_ID_03,
              answer: undefined,
              correct: false,
              lastScore: 0,
              totalScore: 0,
              position: 3,
              streak: 0,
            }),
          ],
          created: expect.anything(),
        })

        expect(actual).toEqual(expected)
      })
    })

    describe('Error Conditions', () => {
      it('throws IllegalTaskTypeException when current task is LeaderboardTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument(),
        })

        expect(() => buildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when current task is PodiumTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument(),
        })

        expect(() => buildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when current task is QuestionResultTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument(),
        })

        expect(() => buildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })
    })

    describe('ZeroToOneHundred Mode', () => {
      it('should build a question result task for ZeroToOneHundred mode with range question', () => {
        const game = createMockGameDocument({
          mode: GameMode.ZeroToOneHundred,
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
          ],
          questions: [createMockRangeQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskRangeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 50,
              }),
              createMockQuestionTaskRangeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_02,
                created: offsetSeconds(4),
                answer: 60,
              }),
            ],
            presented: offsetSeconds(2),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.results).toHaveLength(2)
        expect(actual.results[0].playerId).toBe(PARTICIPANT_PLAYER_ID_01)
        expect(actual.results[0].position).toBe(1)
        expect(actual.results[0].lastScore).toBeLessThan(
          actual.results[1].lastScore,
        )
      })

      it('should assign 100 points to players with no answers in ZeroToOneHundred mode', () => {
        const game = createMockGameDocument({
          mode: GameMode.ZeroToOneHundred,
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_02,
            }),
          ],
          questions: [createMockRangeQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskRangeAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 50,
              }),
            ],
            presented: offsetSeconds(2),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        const playerWithNoAnswer = actual.results.find(
          (result) => result.playerId === PARTICIPANT_PLAYER_ID_02,
        )
        expect(playerWithNoAnswer?.lastScore).toBe(100)
        expect(playerWithNoAnswer?.position).toBe(2)
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty participants array', () => {
        const game = createMockGameDocument({
          participants: [],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument(),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.results).toEqual([])
      })

      it('should handle host-only participants', () => {
        const game = createMockGameDocument({
          participants: [createMockGameHostParticipantDocument({})],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument(),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.results).toEqual([])
      })

      it('should handle single participant', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument(),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.results).toHaveLength(1)
        expect(actual.results[0].position).toBe(1)
      })

      it('should handle players with existing scores and streaks', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
              totalScore: 500,
              currentStreak: 2,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskMultiChoiceAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 0,
              }),
            ],
            presented: offsetSeconds(2),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.results[0].totalScore).toBe(1400)
        expect(actual.results[0].streak).toBe(3)
      })

      it('should reset streak to 0 on incorrect answers', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
              currentStreak: 3,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskMultiChoiceAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 1,
              }),
            ],
            presented: offsetSeconds(2),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.results[0].streak).toBe(0)
      })

      it('should handle multi-choice questions with multiple correct answers', () => {
        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [
            createMockMultiChoiceQuestionDocument({
              options: [
                { value: 'Option 1', correct: true },
                { value: 'Option 2', correct: true },
                { value: 'Option 3', correct: false },
              ],
            }),
          ],
          currentTask: createMockQuestionTaskDocument({
            answers: [
              createMockQuestionTaskMultiChoiceAnswer({
                playerId: PARTICIPANT_PLAYER_ID_01,
                created: offsetSeconds(3),
                answer: 0,
              }),
            ],
            presented: offsetSeconds(2),
          }),
        })

        const actual = buildQuestionResultTask(game as never)

        expect(actual.correctAnswers).toHaveLength(2)
        expect(actual.correctAnswers[0]).toEqual(
          expect.objectContaining({ type: QuestionType.MultiChoice, index: 0 }),
        )
        expect(actual.correctAnswers[1]).toEqual(
          expect.objectContaining({ type: QuestionType.MultiChoice, index: 1 }),
        )
      })
    })
  })

  describe('rebuildQuestionResultTask', () => {
    describe('Basic functionality', () => {
      it('should rebuild question result task for multi-choice question', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskMultiChoiceAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: 0,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectMultiChoice({ index: 0 }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results).toHaveLength(1)
        expect(actual.results[0].playerId).toBe(PARTICIPANT_PLAYER_ID_01)
        expect(actual.results[0].correct).toBe(true)
        expect(actual._id).toBe(currentTask._id)
        expect(actual.correctAnswers).toEqual(currentTask.correctAnswers)
      })

      it('should rebuild question result task for range question', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskRangeAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: 50,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectRange({ value: 50 }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockRangeQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(true)
      })

      it('should rebuild question result task for true-false question', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskTrueFalseAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: false,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectTrueFalse({ value: false }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockTrueFalseQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(true)
      })

      it('should rebuild question result task for type-answer question', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskTypeAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: MOCK_TYPE_ANSWER_OPTION_VALUE,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectTypeAnswer({
              value: MOCK_TYPE_ANSWER_OPTION_VALUE,
            }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockTypeAnswerQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(true)
      })

      it('should rebuild question result task for pin question', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskPinAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: '0.5,0.5',
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectPinAnswer({ value: '0.5,0.5' }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockPinQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(true)
      })

      it('should rebuild question result task for puzzle question', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskPuzzleAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectPuzzleAnswer({
              value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
            }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockPuzzleQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(true)
      })

      it('should rebuild question result task for ZeroToOneHundred mode', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskRangeAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: 50,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [
            createMockQuestionResultTaskCorrectRange({ value: 50 }),
          ],
        })

        const game = createMockGameDocument({
          mode: GameMode.ZeroToOneHundred,
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockRangeQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(true)
      })
    })

    describe('Error Conditions', () => {
      it('throws IllegalTaskTypeException when current task is Question', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionTaskDocument(),
          previousTasks: [createMockQuestionTaskDocument()],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when current task is LeaderboardTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockLeaderboardTaskDocument(),
          previousTasks: [createMockQuestionTaskDocument()],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when current task is PodiumTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockPodiumTaskDocument(),
          previousTasks: [createMockQuestionTaskDocument()],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when previous task is LeaderboardTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument(),
          previousTasks: [createMockLeaderboardTaskDocument()],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when previous task is PodiumTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument(),
          previousTasks: [createMockPodiumTaskDocument()],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when previous task is QuestionResultTask', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument(),
          previousTasks: [createMockQuestionResultTaskDocument()],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })
    })

    describe('Edge Cases', () => {
      it('throws IllegalTaskTypeException when there is no previous task', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument(),
          previousTasks: [],
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('throws IllegalTaskTypeException when previousTasks is undefined', () => {
        const game = createMockGameDocument({
          currentTask: createMockQuestionResultTaskDocument(),
          previousTasks: undefined,
        })

        expect(() => rebuildQuestionResultTask(game as never)).toThrow(
          IllegalTaskTypeException,
        )
      })

      it('should handle empty correctAnswers in current task', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskMultiChoiceAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: 0,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          correctAnswers: [],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual.results[0].correct).toBe(false)
      })

      it('should preserve task metadata when rebuilding', () => {
        const previousTask = createMockQuestionTaskDocument({
          answers: [
            createMockQuestionTaskMultiChoiceAnswer({
              playerId: PARTICIPANT_PLAYER_ID_01,
              created: offsetSeconds(3),
              answer: 0,
            }),
          ],
          presented: offsetSeconds(2),
        })

        const currentTask = createMockQuestionResultTaskDocument({
          _id: 'test-id',
          status: 'completed',
          questionIndex: 5,
          correctAnswers: [
            createMockQuestionResultTaskCorrectMultiChoice({ index: 0 }),
          ],
        })

        const game = createMockGameDocument({
          participants: [
            createMockGameHostParticipantDocument({}),
            createMockGamePlayerParticipantDocument({
              participantId: PARTICIPANT_PLAYER_ID_01,
            }),
          ],
          questions: [createMockMultiChoiceQuestionDocument()],
          currentTask,
          previousTasks: [previousTask],
        })

        const actual = rebuildQuestionResultTask(game as never)

        expect(actual._id).toBe('test-id')
        expect(actual.status).toBe('completed')
        expect(actual.questionIndex).toBe(5)
        expect(actual.correctAnswers).toEqual(currentTask.correctAnswers)
      })
    })
  })
})
