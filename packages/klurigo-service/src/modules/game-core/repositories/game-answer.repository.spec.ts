import { QuestionType } from '@klurigo/common'
import type { Redis } from 'ioredis'

import { GameAnswerRepository } from './game-answer.respository'
import { QuestionTaskAnswer } from './models/schemas'

describe('GameAnswerRepository', () => {
  let redis: jest.Mocked<Redis>
  let repository: GameAnswerRepository
  let logger: { error: jest.Mock }

  beforeEach(() => {
    logger = { error: jest.fn() }

    redis = {
      sadd: jest.fn(),
      srem: jest.fn(),
      multi: jest.fn(),
      lrange: jest.fn(),
      del: jest.fn(),
    } as any

    repository = new GameAnswerRepository(redis as unknown as Redis)
    ;(repository as any).logger = logger
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('submitOnce', () => {
    it('accepts first submission from a player and returns accepted with answer count', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player1',
        type: QuestionType.MultiChoice,
        answer: 2,
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1) // First time adding this player

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1], // rpush result: 1 answer in list
          [null, 'OK'], // ltrim result
          [null, 1], // expire answersKey
          [null, 1], // expire answeredKey
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      const result = await repository.submitOnce('game-123', answer, 3)

      expect(result).toEqual({ accepted: true, answerCount: 1 })
      expect(redis.sadd).toHaveBeenCalledWith(
        'game-123-player-participant-answered',
        'player1',
      )
      expect(mockMulti.rpush).toHaveBeenCalledWith(
        'game-123-player-participant-answers',
        JSON.stringify(answer),
      )
      expect(mockMulti.ltrim).toHaveBeenCalledWith(
        'game-123-player-participant-answers',
        0,
        2, // playerCount - 1
      )
      expect(mockMulti.expire).toHaveBeenCalledTimes(2)
    })

    it('rejects duplicate submission from same player', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player1',
        type: QuestionType.TrueFalse,
        answer: true,
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(0) // Player already in set

      const result = await repository.submitOnce('game-123', answer, 3)

      expect(result).toEqual({ accepted: false })
      expect(redis.sadd).toHaveBeenCalledWith(
        'game-123-player-participant-answered',
        'player1',
      )
      expect(redis.multi).not.toHaveBeenCalled()
    })

    it('handles MultiChoice answer type correctly', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player2',
        type: QuestionType.MultiChoice,
        answer: 0,
        created: new Date('2026-02-07T10:00:00Z'),
      }

      redis.sadd.mockResolvedValue(1)

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 2],
          [null, 'OK'],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      const result = await repository.submitOnce('game-456', answer, 4)

      expect(result).toEqual({ accepted: true, answerCount: 2 })
      expect(mockMulti.rpush).toHaveBeenCalledWith(
        'game-456-player-participant-answers',
        JSON.stringify({
          playerId: 'player2',
          type: QuestionType.MultiChoice,
          answer: 0,
          created: '2026-02-07T10:00:00.000Z',
        }),
      )
    })

    it('handles TypeAnswer answer type correctly', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player3',
        type: QuestionType.TypeAnswer,
        answer: 'Stockholm',
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 'OK'],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await repository.submitOnce('game-789', answer, 2)

      expect(mockMulti.rpush).toHaveBeenCalledWith(
        'game-789-player-participant-answers',
        expect.stringContaining('"answer":"Stockholm"'),
      )
    })

    it('handles Puzzle answer type correctly', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player4',
        type: QuestionType.Puzzle,
        answer: ['piece1', 'piece2', 'piece3'],
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 'OK'],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await repository.submitOnce('game-abc', answer, 5)

      expect(mockMulti.rpush).toHaveBeenCalledWith(
        'game-abc-player-participant-answers',
        expect.stringContaining('"answer":["piece1","piece2","piece3"]'),
      )
    })

    it('caps list size based on playerCount', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player5',
        type: QuestionType.Range,
        answer: 75,
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 10],
          [null, 'OK'],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await repository.submitOnce('game-xyz', answer, 8)

      expect(mockMulti.ltrim).toHaveBeenCalledWith(
        'game-xyz-player-participant-answers',
        0,
        7, // playerCount - 1 = 8 - 1
      )
    })

    it('throws error when Redis transaction returns null and rolls back answered set', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player6',
        type: QuestionType.Pin,
        answer: '45,67',
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)
      redis.srem.mockResolvedValue(1)

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await expect(
        repository.submitOnce('game-fail', answer, 3),
      ).rejects.toThrow('Redis transaction returned null for game game-fail.')

      // Verify rollback: player should be removed from answered set
      expect(redis.srem).toHaveBeenCalledWith(
        'game-fail-player-participant-answered',
        'player6',
      )
    })

    it('throws error when rpush fails in transaction and rolls back answered set', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player7',
        type: QuestionType.TrueFalse,
        answer: false,
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)
      redis.srem.mockResolvedValue(1)

      const rpushError = new Error('rpush failed')
      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [rpushError, null],
          [null, 'OK'],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await expect(
        repository.submitOnce('game-err', answer, 3),
      ).rejects.toThrow('rpush failed')

      // Verify rollback: player should be removed from answered set
      expect(redis.srem).toHaveBeenCalledWith(
        'game-err-player-participant-answered',
        'player7',
      )
    })

    it('caps list size at 0 when playerCount is 0', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player8',
        type: QuestionType.MultiChoice,
        answer: 1,
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)

      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 'OK'],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await repository.submitOnce('game-zero', answer, 0)

      expect(mockMulti.ltrim).toHaveBeenCalledWith(
        'game-zero-player-participant-answers',
        0,
        0,
      )
    })

    it('throws error when ltrim fails in transaction and rolls back answered set', async () => {
      const answer: QuestionTaskAnswer = {
        playerId: 'player9',
        type: QuestionType.MultiChoice,
        answer: 2,
        created: new Date(),
      }

      redis.sadd.mockResolvedValue(1)
      redis.srem.mockResolvedValue(1)

      const ltrimError = new Error('ltrim failed')
      const mockMulti = {
        rpush: jest.fn().mockReturnThis(),
        ltrim: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [ltrimError, null],
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await expect(
        repository.submitOnce('game-ltrim-err', answer, 3),
      ).rejects.toThrow('ltrim failed')

      // Verify rollback: player should be removed from answered set
      expect(redis.srem).toHaveBeenCalledWith(
        'game-ltrim-err-player-participant-answered',
        'player9',
      )
    })
  })

  describe('findAllAnswersByGameId', () => {
    it('returns empty array when no answers exist', async () => {
      redis.lrange.mockResolvedValue([])

      const result = await repository.findAllAnswersByGameId('game-empty')

      expect(result).toEqual([])
      expect(redis.lrange).toHaveBeenCalledWith(
        'game-empty-player-participant-answers',
        0,
        -1,
      )
    })

    it('deserializes and returns all stored answers', async () => {
      const serializedAnswers = [
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.MultiChoice,
          answer: 1,
          created: '2026-02-07T10:00:00Z',
        }),
        JSON.stringify({
          playerId: 'p2',
          type: QuestionType.TrueFalse,
          answer: true,
          created: '2026-02-07T10:01:00Z',
        }),
        JSON.stringify({
          playerId: 'p3',
          type: QuestionType.TypeAnswer,
          answer: 'Paris',
          created: '2026-02-07T10:02:00Z',
        }),
      ]

      redis.lrange.mockResolvedValue(serializedAnswers)

      const result = await repository.findAllAnswersByGameId('game-123')

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        playerId: 'p1',
        type: QuestionType.MultiChoice,
        answer: 1,
        created: new Date('2026-02-07T10:00:00Z'),
      })
      expect(result[1]).toEqual({
        playerId: 'p2',
        type: QuestionType.TrueFalse,
        answer: true,
        created: new Date('2026-02-07T10:01:00Z'),
      })
      expect(result[2]).toEqual({
        playerId: 'p3',
        type: QuestionType.TypeAnswer,
        answer: 'Paris',
        created: new Date('2026-02-07T10:02:00Z'),
      })
    })

    it('deserializes Puzzle answer correctly', async () => {
      const serializedAnswers = [
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.Puzzle,
          answer: ['a', 'b', 'c'],
          created: '2026-02-07T10:00:00Z',
        }),
      ]

      redis.lrange.mockResolvedValue(serializedAnswers)

      const result = await repository.findAllAnswersByGameId('game-puzzle')

      expect(result[0]).toEqual({
        playerId: 'p1',
        type: QuestionType.Puzzle,
        answer: ['a', 'b', 'c'],
        created: new Date('2026-02-07T10:00:00Z'),
      })
    })

    it('throws error when stored value is not valid JSON', async () => {
      redis.lrange.mockResolvedValue(['{invalid json'])

      await expect(
        repository.findAllAnswersByGameId('game-bad'),
      ).rejects.toThrow(
        "Invalid JSON stored for game game-bad answers: '{invalid json'",
      )
    })

    it('throws error when stored value has invalid shape', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({ playerId: 'p1', wrongField: 'data' }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-invalid'),
      ).rejects.toThrow(
        'Invalid QuestionTaskAnswer shape stored for game game-invalid',
      )
    })

    it('throws error when answer type does not match question type', async () => {
      // MultiChoice should have number answer, not string
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.MultiChoice,
          answer: 'wrong-type',
          created: '2026-02-07T10:00:00Z',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-type-mismatch'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape stored for game')
    })

    it('logs and rethrows error on Redis failure', async () => {
      const redisError = new Error('Redis connection lost')
      redis.lrange.mockRejectedValue(redisError)

      await expect(
        repository.findAllAnswersByGameId('game-redis-fail'),
      ).rejects.toThrow('Redis connection lost')

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to retrieve question answers for game game-redis-fail.',
        redisError,
      )
    })
  })

  describe('clear', () => {
    it('deletes both answer and answered keys', async () => {
      const mockMulti = {
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 1],
        ]),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await repository.clear('game-clear')

      expect(mockMulti.del).toHaveBeenCalledWith(
        'game-clear-player-participant-answers',
      )
      expect(mockMulti.del).toHaveBeenCalledWith(
        'game-clear-player-participant-answered',
      )
      expect(mockMulti.exec).toHaveBeenCalled()
    })

    it('logs and rethrows error on Redis failure', async () => {
      const clearError = new Error('Clear failed')
      const mockMulti = {
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(clearError),
      }
      redis.multi.mockReturnValue(mockMulti as any)

      await expect(repository.clear('game-fail-clear')).rejects.toThrow(
        'Clear failed',
      )

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clear question answers for game game-fail-clear.',
        clearError,
      )
    })
  })

  describe('type validation', () => {
    it('validates Range answer must be number', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.Range,
          answer: 'not-a-number',
          created: '2026-02-07T10:00:00Z',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-range-invalid'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape')
    })

    it('validates TrueFalse answer must be boolean', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.TrueFalse,
          answer: 'yes',
          created: '2026-02-07T10:00:00Z',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-bool-invalid'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape')
    })

    it('validates Pin answer must be string', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.Pin,
          answer: 123,
          created: '2026-02-07T10:00:00Z',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-pin-invalid'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape')
    })

    it('validates Puzzle answer must be string array', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.Puzzle,
          answer: [1, 2, 3],
          created: '2026-02-07T10:00:00Z',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-puzzle-invalid'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape')
    })

    it('validates created field is valid date', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: QuestionType.MultiChoice,
          answer: 1,
          created: 'not-a-date',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-date-invalid'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape')
    })

    it('rejects unknown question type', async () => {
      redis.lrange.mockResolvedValue([
        JSON.stringify({
          playerId: 'p1',
          type: 'UnknownType',
          answer: 1,
          created: '2026-02-07T10:00:00Z',
        }),
      ])

      await expect(
        repository.findAllAnswersByGameId('game-unknown-type'),
      ).rejects.toThrow('Invalid QuestionTaskAnswer shape')
    })
  })
})
