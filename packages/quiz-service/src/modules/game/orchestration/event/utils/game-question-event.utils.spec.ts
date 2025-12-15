import {
  GameEventType,
  GameMode,
  MediaType,
  QuestionImageRevealEffectType,
  QuestionType,
} from '@quiz/common'

import {
  createMockGameDocument,
  createMockGamePlayerParticipantDocument,
  createMockMultiChoiceQuestionDocument,
  createMockPinQuestionDocument,
  createMockPuzzleQuestionDocument,
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
} from '../../../../../../test-utils/data'
import { QuestionTaskMetadata } from '../../../repositories/models/schemas'

import {
  buildGameQuestionHostEvent,
  buildGameQuestionPlayerEvent,
  buildGameQuestionPreviewHostEvent,
  buildGameQuestionPreviewPlayerEvent,
} from './game-question-event.utils'

describe('Game Question Event Utils', () => {
  describe('buildGameQuestionPreviewHostEvent', () => {
    it('should return question preview host event with correct structure', () => {
      const question = createMockMultiChoiceQuestionDocument({
        text: 'What is capital of France?',
        points: 1000,
        duration: 30,
      })
      const game = createMockGameDocument({
        mode: GameMode.Classic,
        pin: '123456',
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionPreviewHostEvent(game as never)

      expect(result.type).toBe(GameEventType.GameQuestionPreviewHost)
      expect(result.game.mode).toBe(GameMode.Classic)
      expect(result.game.pin).toBe('123456')
      expect(result.question.type).toBe(QuestionType.MultiChoice)
      expect(result.question.question).toBe('What is capital of France?')
      expect(result.question.points).toBe(1000)
      expect(result.countdown).toBeDefined()
      expect(result.pagination).toBeDefined()
    })
  })

  describe('buildGameQuestionPreviewPlayerEvent', () => {
    it('should return question preview player event with correct structure', () => {
      const question = createMockMultiChoiceQuestionDocument({
        text: 'What is 2+2?',
        points: 500,
        duration: 10,
      })
      const player = createMockGamePlayerParticipantDocument({
        nickname: 'TestPlayer',
        totalScore: 2500,
      })
      const game = createMockGameDocument({
        mode: GameMode.Classic,
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionPreviewPlayerEvent(game as never, player)

      expect(result.type).toBe(GameEventType.GameQuestionPreviewPlayer)
      expect(result.game.mode).toBe(GameMode.Classic)
      expect(result.player.nickname).toBe('TestPlayer')
      expect(result.player.score).toBe(2500)
      expect(result.question.type).toBe(QuestionType.MultiChoice)
      expect(result.question.question).toBe('What is 2+2?')
      expect(result.question.points).toBe(500)
      expect(result.countdown).toBeDefined()
      expect(result.pagination).toBeDefined()
    })

    it('should handle player with zero score', () => {
      const question = createMockMultiChoiceQuestionDocument()
      const player = createMockGamePlayerParticipantDocument({
        nickname: 'NewPlayer',
        totalScore: 0,
      })
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionPreviewPlayerEvent(game as never, player)

      expect(result.player.score).toBe(0)
    })

    it('should handle different game modes', () => {
      const question = createMockMultiChoiceQuestionDocument()
      const player = createMockGamePlayerParticipantDocument()
      const modes = [GameMode.Classic, GameMode.ZeroToOneHundred] as GameMode[]

      modes.forEach((mode) => {
        const game = createMockGameDocument({
          mode,
          questions: [question],
          currentTask: createMockQuestionTaskDocument({
            questionIndex: 0,
            metadata: {
              type: QuestionType.MultiChoice,
            } as QuestionTaskMetadata,
          }),
        })

        const result = buildGameQuestionPreviewPlayerEvent(
          game as never,
          player,
        )

        expect(result.game.mode).toBe(mode)
      })
    })
  })

  describe('buildGameQuestionHostEvent', () => {
    it('should return question host event with submission details', () => {
      const question = createMockMultiChoiceQuestionDocument({
        text: 'Test question',
        points: 1000,
        duration: 30,
      })
      const game = createMockGameDocument({
        pin: '123456',
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 3, 5)

      expect(result.type).toBe(GameEventType.GameQuestionHost)
      expect(result.game.pin).toBe('123456')
      expect(result.question.type).toBe(QuestionType.MultiChoice)
      expect(result.question.question).toBe('Test question')
      expect(result.submissions.current).toBe(3)
      expect(result.submissions.total).toBe(5)
      expect(result.countdown).toBeDefined()
      expect(result.pagination).toBeDefined()
    })

    it('should handle zero submissions', () => {
      const question = createMockMultiChoiceQuestionDocument()
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 10)

      expect(result.submissions.current).toBe(0)
      expect(result.submissions.total).toBe(10)
    })

    it('should handle full submissions', () => {
      const question = createMockMultiChoiceQuestionDocument()
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 10, 10)

      expect(result.submissions.current).toBe(10)
      expect(result.submissions.total).toBe(10)
    })

    it('should handle range question type', () => {
      const question = createMockRangeQuestionDocument({
        min: 0,
        max: 100,
        step: 5,
      })
      const metadata = { type: QuestionType.Range } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.Range)
      if (result.question.type === QuestionType.Range) {
        expect(result.question.min).toBe(0)
        expect(result.question.max).toBe(100)
        expect(result.question.step).toBe(5)
      }
    })

    it('should handle type answer question type', () => {
      const question = createMockTypeAnswerQuestionDocument({
        text: 'What is capital of France?',
      })
      const metadata = { type: QuestionType.TypeAnswer } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.TypeAnswer)
      expect(result.question.question).toBe('What is capital of France?')
    })

    it('should handle pin question type', () => {
      const question = createMockPinQuestionDocument({
        imageURL: 'https://example.com/pin-image.jpg',
      })
      const metadata = { type: QuestionType.Pin } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.Pin)
      if (result.question.type === QuestionType.Pin) {
        expect(result.question.imageURL).toBe(
          'https://example.com/pin-image.jpg',
        )
      }
    })

    it('should handle puzzle question type with metadata', () => {
      const question = createMockPuzzleQuestionDocument()
      const metadata = {
        type: QuestionType.Puzzle,
        randomizedValues: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.Puzzle)
      if (result.question.type === QuestionType.Puzzle) {
        expect(result.question.values).toEqual([
          'Athens',
          'Argos',
          'Plovdiv',
          'Lisbon',
        ])
      }
    })

    it('should handle question with media and effect', () => {
      const question = createMockMultiChoiceQuestionDocument({
        media: {
          type: MediaType.Image,
          url: 'https://example.com/image.jpg',
          effect: QuestionImageRevealEffectType.Blur,
        },
      })
      const metadata = {
        type: QuestionType.MultiChoice,
      } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.MultiChoice)
      if (result.question.type === QuestionType.MultiChoice) {
        expect(result.question.media).toEqual({
          type: MediaType.Image,
          url: 'https://example.com/image.jpg',
          effect: QuestionImageRevealEffectType.Blur,
        })
      }
    })

    it('should handle question without media', () => {
      const question = createMockTrueFalseQuestionDocument({
        media: undefined,
      })
      const metadata = { type: QuestionType.TrueFalse } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.TrueFalse)
      if (result.question.type === QuestionType.TrueFalse) {
        expect(result.question.media).toBeUndefined()
      }
    })

    it('should handle question with non-image media (no effect)', () => {
      const question = createMockMultiChoiceQuestionDocument({
        media: {
          type: MediaType.Audio,
          url: 'https://example.com/audio.mp3',
        },
      })
      const metadata = {
        type: QuestionType.MultiChoice,
      } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.MultiChoice)
      if (result.question.type === QuestionType.MultiChoice) {
        expect(result.question.media).toEqual({
          type: MediaType.Audio,
          url: 'https://example.com/audio.mp3',
        })
        expect('effect' in result.question.media!).toBe(false)
      }
    })

    it('should handle puzzle question without randomizedValues in metadata', () => {
      const question = createMockPuzzleQuestionDocument()
      const metadata = { type: QuestionType.Puzzle } as QuestionTaskMetadata // Missing randomizedValues

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      expect(result.question.type).toBe(QuestionType.Puzzle)
      if (result.question.type === QuestionType.Puzzle) {
        expect(result.question.values).toBeUndefined() // randomizedValues missing from metadata
      }
    })

    it('should handle non-puzzle question with puzzle metadata', () => {
      const question = createMockMultiChoiceQuestionDocument() // Not a puzzle question
      const metadata = {
        type: QuestionType.Puzzle,
        randomizedValues: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      } as QuestionTaskMetadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      // Should not match puzzle condition since question is not a puzzle
      expect(result.question.type).toBe(QuestionType.MultiChoice)
    })

    it('should handle puzzle question with non-puzzle metadata', () => {
      const question = createMockPuzzleQuestionDocument()
      const metadata = {
        type: QuestionType.MultiChoice,
      } as QuestionTaskMetadata // Not puzzle metadata

      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata,
        }),
      })

      const result = buildGameQuestionHostEvent(game as never, 0, 1)

      // When no conditions match, buildGameEventQuestion returns undefined
      expect(result.question).toBeUndefined()
    })
  })

  describe('buildGameQuestionPlayerEvent', () => {
    it('should return question player event with answer when provided', () => {
      const question = createMockMultiChoiceQuestionDocument({
        text: 'What is capital of Spain?',
        points: 800,
        duration: 20,
      })
      const player = createMockGamePlayerParticipantDocument({
        nickname: 'PlayerOne',
        totalScore: 3200,
      })
      const answer = createMockQuestionTaskMultiChoiceAnswer({
        answer: 2, // Madrid
      })
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionPlayerEvent(game as never, player, answer)

      expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      expect(result.player.nickname).toBe('PlayerOne')
      expect(result.player.score.total).toBe(3200)
      expect(result.question.type).toBe(QuestionType.MultiChoice)
      expect(result.question.question).toBe('What is capital of Spain?')
      expect(result.answer).toEqual({
        type: QuestionType.MultiChoice,
        value: 2,
      })
      expect(result.countdown).toBeDefined()
      expect(result.pagination).toBeDefined()
    })

    it('should return question player event without answer when not provided', () => {
      const question = createMockTrueFalseQuestionDocument()
      const player = createMockGamePlayerParticipantDocument({
        nickname: 'PlayerTwo',
        totalScore: 1500,
      })
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.TrueFalse } as QuestionTaskMetadata,
        }),
      })

      const result = buildGameQuestionPlayerEvent(game as never, player)

      expect(result.type).toBe(GameEventType.GameQuestionPlayer)
      expect(result.answer).toBeUndefined()
    })

    it('should handle different answer types', () => {
      const question = createMockMultiChoiceQuestionDocument()
      const player = createMockGamePlayerParticipantDocument()
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const testCases = [
        {
          answer: createMockQuestionTaskMultiChoiceAnswer({ answer: 1 }),
          expectedType: QuestionType.MultiChoice,
          expectedValue: 1,
        },
        {
          answer: createMockQuestionTaskTrueFalseAnswer({ answer: true }),
          expectedType: QuestionType.TrueFalse,
          expectedValue: true,
        },
        {
          answer: createMockQuestionTaskRangeAnswer({ answer: 75 }),
          expectedType: QuestionType.Range,
          expectedValue: 75,
        },
        {
          answer: createMockQuestionTaskTypeAnswer({ answer: 'Paris' }),
          expectedType: QuestionType.TypeAnswer,
          expectedValue: 'Paris',
        },
        {
          answer: createMockQuestionTaskPinAnswer({ answer: '0.5,0.5' }),
          expectedType: QuestionType.Pin,
          expectedValue: '0.5,0.5',
        },
      ]

      testCases.forEach(({ answer, expectedType, expectedValue }) => {
        const result = buildGameQuestionPlayerEvent(
          game as never,
          player,
          answer,
        )

        expect(result.answer).toEqual({
          type: expectedType,
          value: expectedValue,
        })
      })
    })

    it('should handle puzzle answer type', () => {
      const question = createMockMultiChoiceQuestionDocument()
      const player = createMockGamePlayerParticipantDocument()
      const game = createMockGameDocument({
        questions: [question],
        currentTask: createMockQuestionTaskDocument({
          questionIndex: 0,
          metadata: { type: QuestionType.MultiChoice } as QuestionTaskMetadata,
        }),
      })

      const answer = createMockQuestionTaskPuzzleAnswer({
        answer: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      })

      const result = buildGameQuestionPlayerEvent(game as never, player, answer)

      expect(result.answer).toEqual({
        type: QuestionType.Puzzle,
        value: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      })
    })
  })
})
