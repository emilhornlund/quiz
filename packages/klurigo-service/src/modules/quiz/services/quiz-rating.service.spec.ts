import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import {
  buildMockPrimaryUser,
  createMockClassicQuiz,
} from '../../../../test-utils/data'
import { QuizRepository } from '../../quiz-core/repositories'
import { QuizRatingByQuizAndAuthorNotFoundException } from '../exceptions'
import { QuizRatingRepository } from '../repositories'
import { QuizRating } from '../repositories/models/schemas'

// eslint-disable-next-line import/order
import { QuizRatingService } from './quiz-rating.service'

jest.mock('./utils', () => {
  const actual = jest.requireActual('./utils')
  return {
    __esModule: true,
    ...actual,
    updateQuizRatingSummary: jest.fn(),
  }
})

import { updateQuizRatingSummary } from './utils'

describe(QuizRatingService.name, () => {
  let service: QuizRatingService

  let quizRepository: {
    findQuizByIdOrThrow: jest.Mock
    updateQuiz: jest.Mock
  }

  let quizRatingRepository: {
    findQuizRatingByAuthor: jest.Mock
    findQuizRatingsWithPagination: jest.Mock
    createQuizRating: jest.Mock
    updateQuizRating: jest.Mock
  }

  let logger: {
    debug: jest.Mock
  }

  const fixedNow = new Date('2026-01-10T12:00:00.000Z')

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedNow)

    quizRepository = {
      findQuizByIdOrThrow: jest.fn(),
      updateQuiz: jest.fn(),
    }

    quizRatingRepository = {
      findQuizRatingByAuthor: jest.fn(),
      findQuizRatingsWithPagination: jest.fn(),
      createQuizRating: jest.fn(),
      updateQuizRating: jest.fn(),
    }

    logger = {
      debug: jest.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizRatingService,
        { provide: QuizRepository, useValue: quizRepository },
        { provide: QuizRatingRepository, useValue: quizRatingRepository },
        { provide: Logger, useValue: logger },
      ],
    }).compile()

    service = moduleRef.get(QuizRatingService)

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const createRating = (args?: Partial<QuizRating>): QuizRating =>
    ({
      _id: 'rating-1',
      quizId: 'quiz-1',
      stars: 5,
      comment: 'Great quiz',
      author: buildMockPrimaryUser(),
      created: new Date('2026-01-10T10:00:00.000Z'),
      updated: new Date('2026-01-10T11:00:00.000Z'),
      ...(args ?? {}),
    }) as unknown as QuizRating

  describe('findQuizRatingByQuizIdAndAuthor', () => {
    it('returns mapped DTO when rating exists', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()

      const rating = createRating({
        quizId,
        author,
        stars: 3,
        comment: 'Ok',
        created: new Date('2026-01-10T09:00:00.000Z'),
        updated: new Date('2026-01-10T09:30:00.000Z'),
      })

      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(rating)

      const result = await service.findQuizRatingByQuizIdAndAuthor(
        quizId,
        author as unknown as any,
      )

      expect(quizRatingRepository.findQuizRatingByAuthor).toHaveBeenCalledTimes(
        1,
      )
      expect(quizRatingRepository.findQuizRatingByAuthor).toHaveBeenCalledWith(
        quizId,
        author,
      )

      expect(result).toEqual({
        id: rating._id,
        quizId: rating.quizId,
        stars: rating.stars,
        comment: rating.comment,
        author: {
          id: author._id,
          nickname: author.defaultNickname,
        },
        createdAt: rating.created,
        updatedAt: rating.updated,
      })
    })

    it('throws QuizRatingByQuizAndAuthorNotFoundException when rating does not exist', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({ _id: 'user-404' })

      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(null)

      await expect(
        service.findQuizRatingByQuizIdAndAuthor(
          quizId,
          author as unknown as any,
        ),
      ).rejects.toBeInstanceOf(QuizRatingByQuizAndAuthorNotFoundException)

      await expect(
        service.findQuizRatingByQuizIdAndAuthor(
          quizId,
          author as unknown as any,
        ),
      ).rejects.toThrow(
        `Quiz rating was not found by quiz id '${quizId}' and author id '${author._id}'`,
      )
    })
  })

  describe('findQuizRatingsWithPagination', () => {
    it('delegates to repository, logs debug messages, and maps results to DTOs', async () => {
      const quizId = 'quiz-1'
      const options = {
        offset: 10,
        limit: 2,
        sort: { field: 'created' as const, order: 'asc' as const },
        commentsOnly: true,
      }

      const rating1 = createRating({
        _id: 'r1',
        quizId,
        stars: 5,
        comment: 'Fantastic',
        author: buildMockPrimaryUser({ _id: 'u1', defaultNickname: 'A' }),
        created: new Date('2026-01-10T08:00:00.000Z'),
        updated: new Date('2026-01-10T08:10:00.000Z'),
      })

      const rating2 = createRating({
        _id: 'r2',
        quizId,
        stars: 2,
        comment: 'Meh',
        author: buildMockPrimaryUser({ _id: 'u2', defaultNickname: 'B' }),
        created: new Date('2026-01-10T08:30:00.000Z'),
        updated: new Date('2026-01-10T08:40:00.000Z'),
      })

      quizRatingRepository.findQuizRatingsWithPagination.mockResolvedValue({
        results: [rating1, rating2],
        total: 123,
        limit: options.limit,
        offset: options.offset,
      })

      const result = await service.findQuizRatingsWithPagination(
        quizId,
        options,
      )

      expect(logger.debug).toHaveBeenCalledTimes(2)
      expect(logger.debug).toHaveBeenNthCalledWith(
        1,
        `Find quiz ratings for ${quizId}`,
      )
      expect(logger.debug).toHaveBeenNthCalledWith(
        2,
        `Found 123 quiz ratings for ${quizId}`,
      )

      expect(
        quizRatingRepository.findQuizRatingsWithPagination,
      ).toHaveBeenCalledTimes(1)
      expect(
        quizRatingRepository.findQuizRatingsWithPagination,
      ).toHaveBeenCalledWith(quizId, options)

      expect(result).toEqual({
        results: [
          {
            id: 'r1',
            quizId,
            stars: 5,
            comment: 'Fantastic',
            author: { id: 'u1', nickname: 'A' },
            createdAt: rating1.created,
            updatedAt: rating1.updated,
          },
          {
            id: 'r2',
            quizId,
            stars: 2,
            comment: 'Meh',
            author: { id: 'u2', nickname: 'B' },
            createdAt: rating2.created,
            updatedAt: rating2.updated,
          },
        ],
        total: 123,
        limit: options.limit,
        offset: options.offset,
      })
    })
  })

  describe('createOrUpdateQuizRating', () => {
    it('creates rating when no existing rating exists, updates rating summary, and persists quiz update', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({
        _id: 'user-1',
        defaultNickname: 'Emil',
      })
      const stars = 4
      const comment = 'Nice'

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 0,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        },
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(null)

      const createdRating = createRating({
        _id: 'rating-new',
        quizId,
        author,
        stars,
        comment,
        created: fixedNow,
        updated: fixedNow,
      })

      quizRatingRepository.createQuizRating.mockResolvedValue(createdRating)
      ;(updateQuizRatingSummary as jest.Mock).mockReturnValue({
        count: 1,
        avg: 4,
        stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 },
        updated: fixedNow,
      })

      const result = await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        stars,
        comment,
      )

      expect(quizRepository.findQuizByIdOrThrow).toHaveBeenCalledTimes(1)
      expect(quizRepository.findQuizByIdOrThrow).toHaveBeenCalledWith(quizId)

      expect(quizRatingRepository.findQuizRatingByAuthor).toHaveBeenCalledTimes(
        1,
      )
      expect(quizRatingRepository.findQuizRatingByAuthor).toHaveBeenCalledWith(
        quizId,
        author,
      )

      expect(quizRatingRepository.createQuizRating).toHaveBeenCalledTimes(1)
      expect(quizRatingRepository.createQuizRating).toHaveBeenCalledWith(
        quizId,
        author,
        fixedNow,
        stars,
        comment,
      )
      expect(quizRatingRepository.updateQuizRating).not.toHaveBeenCalled()

      expect(updateQuizRatingSummary).toHaveBeenCalledTimes(1)
      expect(updateQuizRatingSummary).toHaveBeenCalledWith({
        summary: existingQuiz.ratingSummary,
        previousStars: undefined,
        nextStars: stars,
        updatedAt: fixedNow,
      })

      expect(quizRepository.updateQuiz).toHaveBeenCalledTimes(1)
      expect(quizRepository.updateQuiz).toHaveBeenCalledWith(quizId, {
        ...existingQuiz,
        ratingSummary: {
          count: 1,
          avg: 4,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 },
          updated: fixedNow,
        },
      })

      expect(result).toEqual({
        id: 'rating-new',
        quizId,
        stars: 4,
        comment: 'Nice',
        author: { id: 'user-1', nickname: 'Emil' },
        createdAt: createdRating.created,
        updatedAt: createdRating.updated,
      })
    })

    it('updates rating when existing rating exists, includes previousStars in summary update, and persists quiz update', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({
        _id: 'user-1',
        defaultNickname: 'Emil',
      })
      const stars = 2
      const comment = 'Changed my mind'

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 10,
          avg: 3.5,
          stars: { '1': 1, '2': 2, '3': 3, '4': 2, '5': 2 },
          updated: fixedNow,
        },
      })

      const existingRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 5,
        comment: 'Old comment',
      })

      const updatedRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars,
        comment,
        updated: fixedNow,
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(
        existingRating,
      )
      quizRatingRepository.updateQuizRating.mockResolvedValue(updatedRating)
      ;(updateQuizRatingSummary as jest.Mock).mockReturnValue({
        count: 10,
        avg: 3.2,
        stars: { '1': 1, '2': 3, '3': 3, '4': 2, '5': 1 },
        updated: fixedNow,
      })

      const result = await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        stars,
        comment,
      )

      expect(quizRatingRepository.updateQuizRating).toHaveBeenCalledTimes(1)
      expect(quizRatingRepository.updateQuizRating).toHaveBeenCalledWith(
        existingRating._id,
        fixedNow,
        stars,
        comment,
      )
      expect(quizRatingRepository.createQuizRating).not.toHaveBeenCalled()

      expect(updateQuizRatingSummary).toHaveBeenCalledTimes(1)
      expect(updateQuizRatingSummary).toHaveBeenCalledWith({
        summary: existingQuiz.ratingSummary,
        previousStars: 5,
        nextStars: 2,
        updatedAt: fixedNow,
      })

      expect(quizRepository.updateQuiz).toHaveBeenCalledTimes(1)
      expect(quizRepository.updateQuiz).toHaveBeenCalledWith(quizId, {
        ...existingQuiz,
        ratingSummary: {
          count: 10,
          avg: 3.2,
          stars: { '1': 1, '2': 3, '3': 3, '4': 2, '5': 1 },
          updated: fixedNow,
        },
      })

      expect(result).toEqual({
        id: 'rating-1',
        quizId,
        stars: 2,
        comment: 'Changed my mind',
        author: { id: 'user-1', nickname: 'Emil' },
        createdAt: updatedRating.created,
        updatedAt: updatedRating.updated,
      })
    })

    it('does not call updateQuizRatingSummary with a new Date instance different from system time', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()
      const stars = 1

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 0,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        },
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(null)

      const createdRating = createRating({
        _id: 'rating-new',
        quizId,
        author,
        stars,
        comment: undefined,
        created: fixedNow,
        updated: fixedNow,
      })

      quizRatingRepository.createQuizRating.mockResolvedValue(createdRating)
      ;(updateQuizRatingSummary as jest.Mock).mockImplementation(
        (args: any) => ({
          ...args.summary,
          updated: args.updatedAt,
        }),
      )

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        stars,
      )

      const call = (updateQuizRatingSummary as jest.Mock).mock.calls[0]?.[0]
      expect(call.updatedAt).toEqual(fixedNow)
    })
  })
})
