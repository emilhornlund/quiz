import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import type { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { buildMockPrimaryUser } from '../../../../test-utils/data'
import { buildSortObject } from '../../../app/shared/repository'

import { QuizRating } from './models/schemas'
import { QuizRatingRepository } from './quiz-rating.repository'

jest.mock('uuid', () => ({
  v4: jest.fn(),
}))

jest.mock('../../../app/shared/repository', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class BaseRepository<T> {
    protected readonly model: unknown
    protected readonly entityName: string

    // BaseRepository methods used by QuizRatingRepository
    public findOne: jest.Mock
    public findWithPagination: jest.Mock
    public create: jest.Mock
    public update: jest.Mock

    constructor(model: unknown, entityName: string) {
      this.model = model
      this.entityName = entityName
      this.findOne = jest.fn()
      this.findWithPagination = jest.fn()
      this.create = jest.fn()
      this.update = jest.fn()
    }
  }

  return {
    BaseRepository,
    buildSortObject: jest.fn(),
  }
})

describe(QuizRatingRepository.name, () => {
  let repository: QuizRatingRepository
  let quizRatingModel: Partial<Model<QuizRating>>

  const fixedNow = new Date('2026-01-10T12:00:00.000Z')

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedNow)

    quizRatingModel = {}

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizRatingRepository,
        {
          provide: getModelToken(QuizRating.name),
          useValue: quizRatingModel,
        },
      ],
    }).compile()

    repository = moduleRef.get(QuizRatingRepository)

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('findQuizRatingByAuthor', () => {
    it('calls BaseRepository.findOne with quizId and author and returns the document', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()
      const expected = {
        _id: 'rating-1',
        quizId,
        author,
        stars: 5,
        created: fixedNow,
        updated: fixedNow,
      } as unknown as QuizRating

      ;(repository.findOne as jest.Mock).mockResolvedValue(expected)

      const result = await repository.findQuizRatingByAuthor(
        quizId,
        author as unknown as any,
      )

      expect(repository.findOne).toHaveBeenCalledTimes(1)
      expect(repository.findOne).toHaveBeenCalledWith({ quizId, author })
      expect(result).toBe(expected)
    })

    it('returns null when BaseRepository.findOne returns null', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()

      ;(repository.findOne as jest.Mock).mockResolvedValue(null)

      const result = await repository.findQuizRatingByAuthor(
        quizId,
        author as unknown as any,
      )

      expect(repository.findOne).toHaveBeenCalledTimes(1)
      expect(repository.findOne).toHaveBeenCalledWith({ quizId, author })
      expect(result).toBeNull()
    })
  })

  describe('findQuizRatingsWithPagination', () => {
    it('builds filter without comment constraint when commentsOnly is false/undefined', async () => {
      const quizId = 'quiz-1'

      ;(buildSortObject as jest.Mock).mockReturnValue({ updated: -1 })

      const documents = [
        { _id: 'r1' },
        { _id: 'r2' },
      ] as unknown as QuizRating[]

      ;(repository.findWithPagination as jest.Mock).mockResolvedValue({
        documents,
        total: 2,
      })

      const result = await repository.findQuizRatingsWithPagination(quizId, {})

      expect(buildSortObject).toHaveBeenCalledTimes(1)
      expect(buildSortObject).toHaveBeenCalledWith({
        field: 'updated',
        direction: 1,
      })

      expect(repository.findWithPagination).toHaveBeenCalledTimes(1)
      expect(repository.findWithPagination).toHaveBeenCalledWith(
        { quizId },
        {
          skip: 0,
          limit: 5,
          sort: { updated: -1 },
          populate: 'author',
        },
      )

      expect(result).toEqual({
        results: documents,
        total: 2,
        limit: 5,
        offset: 0,
      })
    })

    it('adds non-empty comment filter when commentsOnly is true', async () => {
      const quizId = 'quiz-1'

      ;(buildSortObject as jest.Mock).mockReturnValue({ updated: -1 })
      ;(repository.findWithPagination as jest.Mock).mockResolvedValue({
        documents: [],
        total: 0,
      })

      await repository.findQuizRatingsWithPagination(quizId, {
        commentsOnly: true,
      })

      expect(repository.findWithPagination).toHaveBeenCalledTimes(1)
      expect(repository.findWithPagination).toHaveBeenCalledWith(
        {
          quizId,
          comment: { $exists: true, $ne: '' },
        },
        expect.objectContaining({
          skip: 0,
          limit: 5,
          populate: 'author',
        }),
      )
    })

    it('respects offset and limit options', async () => {
      const quizId = 'quiz-1'

      ;(buildSortObject as jest.Mock).mockReturnValue({ created: 1 })
      ;(repository.findWithPagination as jest.Mock).mockResolvedValue({
        documents: [],
        total: 0,
      })

      const result = await repository.findQuizRatingsWithPagination(quizId, {
        offset: 10,
        limit: 25,
        sort: { field: 'created', order: 'asc' },
      })

      expect(buildSortObject).toHaveBeenCalledTimes(1)
      expect(buildSortObject).toHaveBeenCalledWith({
        field: 'created',
        direction: 1,
      })

      expect(repository.findWithPagination).toHaveBeenCalledTimes(1)
      expect(repository.findWithPagination).toHaveBeenCalledWith(
        { quizId },
        {
          skip: 10,
          limit: 25,
          sort: { created: 1 },
          populate: 'author',
        },
      )

      expect(result).toEqual({
        results: [],
        total: 0,
        limit: 25,
        offset: 10,
      })
    })

    it('defaults sort.field to updated and order to desc when sort is partially provided', async () => {
      const quizId = 'quiz-1'

      ;(buildSortObject as jest.Mock).mockReturnValue({ updated: -1 })
      ;(repository.findWithPagination as jest.Mock).mockResolvedValue({
        documents: [],
        total: 0,
      })

      await repository.findQuizRatingsWithPagination(quizId, {
        sort: {},
      })

      expect(buildSortObject).toHaveBeenCalledTimes(1)
      expect(buildSortObject).toHaveBeenCalledWith({
        field: 'updated',
        direction: 1,
      })
    })

    it('maps BaseRepository.findWithPagination response to {results,total,limit,offset}', async () => {
      const quizId = 'quiz-1'

      ;(buildSortObject as jest.Mock).mockReturnValue({ updated: -1 })

      const documents = [{ _id: 'r1' }] as unknown as QuizRating[]

      ;(repository.findWithPagination as jest.Mock).mockResolvedValue({
        documents,
        total: 123,
      })

      const result = await repository.findQuizRatingsWithPagination(quizId, {
        offset: 7,
        limit: 9,
      })

      expect(result).toEqual({
        results: documents,
        total: 123,
        limit: 9,
        offset: 7,
      })
    })
  })

  describe('createQuizRating', () => {
    it('creates a rating with generated id and created/updated timestamps set to now', async () => {
      const quizId = 'quiz-1'
      const stars = 4
      const comment = 'Nice quiz'

      ;(uuidv4 as unknown as jest.Mock)
        .mockReturnValueOnce('user-uuid-1') // buildMockPrimaryUser()
        .mockReturnValueOnce('rating-uuid-1') // createQuizRating()

      const author = buildMockPrimaryUser()

      const created = {
        _id: 'rating-uuid-1',
        quizId,
        author,
        stars,
        comment,
        created: fixedNow,
        updated: fixedNow,
      } as unknown as QuizRating

      ;(repository.create as jest.Mock).mockResolvedValue(created)

      const result = await repository.createQuizRating(
        quizId,
        author as unknown as any,
        fixedNow,
        stars,
        comment,
      )

      expect(uuidv4).toHaveBeenCalledTimes(2)
      expect(repository.create).toHaveBeenCalledWith({
        _id: 'rating-uuid-1',
        quizId,
        author,
        stars,
        comment,
        created: fixedNow,
        updated: fixedNow,
      })
      expect(result).toBe(created)
    })

    it('creates a rating without comment when comment is undefined', async () => {
      const quizId = 'quiz-1'
      const author = buildMockPrimaryUser()
      const stars = 3

      ;(uuidv4 as unknown as jest.Mock).mockReturnValue('uuid-2')

      const created = {
        _id: 'uuid-2',
        quizId,
        author,
        stars,
        created: fixedNow,
        updated: fixedNow,
      } as unknown as QuizRating

      ;(repository.create as jest.Mock).mockResolvedValue(created)

      await repository.createQuizRating(
        quizId,
        author as unknown as any,
        fixedNow,
        stars,
      )

      expect(repository.create).toHaveBeenCalledTimes(1)
      expect(repository.create).toHaveBeenCalledWith({
        _id: 'uuid-2',
        quizId,
        author,
        stars,
        comment: undefined,
        created: fixedNow,
        updated: fixedNow,
      })
    })
  })

  describe('updateQuizRating', () => {
    it('updates rating by id and returns the updated document', async () => {
      const ratingId = 'rating-1'
      const stars = 2
      const comment = 'Not great'

      const updated = {
        _id: ratingId,
        stars,
        comment,
        updated: fixedNow,
      } as unknown as QuizRating

      ;(repository.update as jest.Mock).mockResolvedValue(updated)

      const result = await repository.updateQuizRating(
        ratingId,
        fixedNow,
        stars,
        comment,
      )

      expect(repository.update).toHaveBeenCalledTimes(1)
      expect(repository.update).toHaveBeenCalledWith(
        ratingId,
        { stars, comment, updated: fixedNow },
        { populate: { path: 'author' } },
      )
      expect(result).toBe(updated)
    })

    it('returns null when the rating does not exist', async () => {
      const ratingId = 'missing-rating'
      const stars = 5

      ;(repository.update as jest.Mock).mockResolvedValue(null)

      await expect(
        repository.updateQuizRating(ratingId, fixedNow, stars),
      ).resolves.toBeNull()

      expect(repository.update).toHaveBeenCalledTimes(1)
      expect(repository.update).toHaveBeenCalledWith(
        ratingId,
        { stars, comment: undefined, updated: fixedNow },
        { populate: { path: 'author' } },
      )
    })

    it('always sets updated timestamp to now', async () => {
      const ratingId = 'rating-1'
      const now2 = new Date('2026-01-10T12:30:00.000Z')
      jest.setSystemTime(now2)
      ;(repository.update as jest.Mock).mockResolvedValue({
        _id: ratingId,
      } as unknown as QuizRating)

      await repository.updateQuizRating(ratingId, now2, 1, 'x')

      expect(repository.update).toHaveBeenCalledTimes(1)
      expect(repository.update).toHaveBeenCalledWith(
        ratingId,
        { stars: 1, comment: 'x', updated: now2 },
        { populate: { path: 'author' } },
      )
    })
  })
})
