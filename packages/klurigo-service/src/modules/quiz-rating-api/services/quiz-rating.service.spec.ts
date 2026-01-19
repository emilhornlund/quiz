import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import {
  buildMockPrimaryUser,
  createMockClassicQuiz,
} from '../../../../test-utils/data'
import { QuizRepository } from '../../quiz-core/repositories'
import { QuizRatingRepository } from '../../quiz-core/repositories'
import { QuizRating } from '../../quiz-core/repositories/models/schemas'
import { QuizRatingByQuizAndAuthorNotFoundException } from '../exceptions'
import { updateQuizRatingSummary } from '../utils'

import { QuizRatingService } from './quiz-rating.service'

// Avoid depending on MurLock implementation details in a unit test.
// We only want to test the business logic inside `clean()`.
jest.mock('murlock', () => ({
  MurLock:
    () =>
    (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}))

describe(QuizRatingService.name, () => {
  let service: QuizRatingService

  let quizRepository: {
    findQuizByIdOrThrow: jest.Mock
    replaceQuiz: jest.Mock
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
      replaceQuiz: jest.fn(),
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
          commentCount: 0,
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

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: undefined,
        nextStars: stars,
        previousComment: undefined,
        nextComment: comment,
        updatedAt: fixedNow,
      })

      expect(quizRepository.replaceQuiz).toHaveBeenCalledWith(quizId, {
        ...existingQuiz,
        ratingSummary: expectedSummary,
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
          commentCount: 7,
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

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: existingRating.stars,
        nextStars: stars,
        previousComment: existingRating.comment,
        nextComment: comment,
        updatedAt: fixedNow,
      })

      expect(quizRepository.replaceQuiz).toHaveBeenCalledWith(quizId, {
        ...existingQuiz,
        ratingSummary: expectedSummary,
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

    it('updates stars only when comment remains present (commentCount unchanged)', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({
        _id: 'user-1',
        defaultNickname: 'Emil',
      })

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 2,
          avg: 3.0,
          stars: { '1': 0, '2': 1, '3': 0, '4': 1, '5': 0 },
          commentCount: 1,
          updated: fixedNow,
        },
      })

      const existingRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 4,
        comment: 'Hard',
      })

      const updatedRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 2,
        comment: 'Hard',
        updated: fixedNow,
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(
        existingRating,
      )
      quizRatingRepository.updateQuizRating.mockResolvedValue(updatedRating)

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        2,
        'Hard',
      )

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const [, updatedQuiz] = quizRepository.replaceQuiz.mock.calls[0]

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: existingRating.stars,
        nextStars: 2,
        previousComment: existingRating.comment,
        nextComment: 'Hard',
        updatedAt: fixedNow,
      })

      expect(updatedQuiz.ratingSummary).toEqual(expectedSummary)
    })

    it('decrements commentCount when comment is removed (present -> absent) without changing stars', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({
        _id: 'user-1',
        defaultNickname: 'Emil',
      })

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 2,
          avg: 4.5,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 1 },
          commentCount: 2,
          updated: fixedNow,
        },
      })

      const existingRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 5,
        comment: 'Great',
      })

      const updatedRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 5,
        comment: undefined,
        updated: fixedNow,
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(
        existingRating,
      )
      quizRatingRepository.updateQuizRating.mockResolvedValue(updatedRating)

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        5,
        undefined,
      )

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const [, updatedQuiz] = quizRepository.replaceQuiz.mock.calls[0]

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: existingRating.stars,
        nextStars: 5,
        previousComment: existingRating.comment,
        nextComment: undefined,
        updatedAt: fixedNow,
      })

      expect(updatedQuiz.ratingSummary).toEqual(expectedSummary)
    })

    it('increments commentCount when comment is added (absent -> present) without changing stars', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({
        _id: 'user-1',
        defaultNickname: 'Emil',
      })

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 1,
          avg: 2,
          stars: { '1': 0, '2': 1, '3': 0, '4': 0, '5': 0 },
          commentCount: 0,
          updated: fixedNow,
        },
      })

      const existingRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 2,
        comment: undefined,
      })

      const updatedRating = createRating({
        _id: 'rating-1',
        quizId,
        author,
        stars: 2,
        comment: 'Nice',
        updated: fixedNow,
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(
        existingRating,
      )
      quizRatingRepository.updateQuizRating.mockResolvedValue(updatedRating)

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        2,
        'Nice',
      )

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const [, updatedQuiz] = quizRepository.replaceQuiz.mock.calls[0]

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: existingRating.stars,
        nextStars: 2,
        previousComment: existingRating.comment,
        nextComment: 'Nice',
        updatedAt: fixedNow,
      })

      expect(updatedQuiz.ratingSummary).toEqual(expectedSummary)
    })

    it('treats whitespace-only comment as absent for commentCount', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({
        _id: 'user-1',
        defaultNickname: 'Emil',
      })

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 1,
          avg: 4,
          stars: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 0 },
          commentCount: 0,
          updated: fixedNow,
        },
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(null)

      const createdRating = createRating({
        _id: 'rating-new',
        quizId,
        author,
        stars: 4,
        comment: '   ',
        created: fixedNow,
        updated: fixedNow,
      })

      quizRatingRepository.createQuizRating.mockResolvedValue(createdRating)

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        4,
        '   ',
      )

      expect(quizRepository.findQuizByIdOrThrow).toHaveBeenCalledWith(quizId)

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const [, updatedQuiz] = quizRepository.replaceQuiz.mock.calls[0]

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: undefined,
        nextStars: 4,
        previousComment: undefined,
        nextComment: '   ',
        updatedAt: fixedNow,
      })

      expect(updatedQuiz.ratingSummary).toEqual(expectedSummary)
    })

    it('uses the same `now` timestamp for rating write and summary.updated', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 0,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          commentCount: 0,
        },
      })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(null)

      const createdRating = createRating({
        _id: 'rating-new',
        quizId,
        author,
        stars: 1,
        comment: undefined,
        created: fixedNow,
        updated: fixedNow,
      })

      quizRatingRepository.createQuizRating.mockResolvedValue(createdRating)

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        1,
      )

      expect(quizRatingRepository.createQuizRating).toHaveBeenCalledWith(
        quizId,
        author,
        fixedNow,
        1,
        undefined,
      )

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const [, updatedQuiz] = quizRepository.replaceQuiz.mock.calls[0]

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: undefined,
        nextStars: 1,
        previousComment: undefined,
        nextComment: undefined,
        updatedAt: fixedNow,
      })

      expect(updatedQuiz.ratingSummary).toEqual(expectedSummary)
    })

    it('throws when the repository returns null (and does not update quiz)', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser({ _id: 'user-1' })

      const existingQuiz = createMockClassicQuiz({ _id: quizId })

      quizRepository.findQuizByIdOrThrow.mockResolvedValue(existingQuiz)
      quizRatingRepository.findQuizRatingByAuthor.mockResolvedValue(null)
      quizRatingRepository.createQuizRating.mockResolvedValue(null)

      await expect(
        service.createOrUpdateQuizRating(
          quizId,
          author as unknown as any,
          5,
          'Nice',
        ),
      ).rejects.toBeInstanceOf(QuizRatingByQuizAndAuthorNotFoundException)

      expect(quizRepository.replaceQuiz).not.toHaveBeenCalled()
    })

    it('uses system time (`now`) consistently for repository write and summary.updated', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()
      const stars = 1

      const existingQuiz = createMockClassicQuiz({
        _id: quizId,
        ratingSummary: {
          count: 0,
          avg: 0,
          stars: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          commentCount: 0,
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

      await service.createOrUpdateQuizRating(
        quizId,
        author as unknown as any,
        stars,
      )

      expect(quizRatingRepository.createQuizRating).toHaveBeenCalledWith(
        quizId,
        author,
        fixedNow,
        stars,
        undefined,
      )

      expect(quizRepository.replaceQuiz).toHaveBeenCalledTimes(1)

      const [, updatedQuiz] = quizRepository.replaceQuiz.mock.calls[0]

      const expectedSummary = updateQuizRatingSummary({
        summary: existingQuiz.ratingSummary,
        previousStars: undefined,
        nextStars: stars,
        previousComment: undefined,
        nextComment: undefined,
        updatedAt: fixedNow,
      })

      expect(updatedQuiz.ratingSummary).toEqual(expectedSummary)
    })
  })
})
