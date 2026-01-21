import { QuizNotFoundException } from '../exceptions'

import { QuizRepository } from './quiz.repository'

/**
 * We mock the shared repository layer so we can unit-test QuizRepository in isolation
 * (i.e., without depending on BaseRepository implementation details).
 */
jest.mock('../../../app/shared/repository', () => {
  class BaseRepositoryMock<T> {
    // Expose the methods QuizRepository delegates to.
    public count = jest.fn<Promise<number>, [unknown]>()
    public findWithPagination = jest.fn<
      Promise<{ documents: T[] }>,
      [
        unknown,
        { skip: number; limit: number; sort: unknown; populate?: unknown },
      ]
    >()
    public create = jest.fn<Promise<T>, [Partial<T>]>()
    public update = jest.fn<Promise<T | null>, [string, Partial<T>]>()
    public delete = jest.fn<Promise<boolean>, [string]>()

    // Keep constructor shape compatible with super(quizModel, 'Quiz')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_model: unknown, _entityName: string) {}
  }

  return {
    BaseRepository: BaseRepositoryMock,
    buildSortObject: jest.fn((opts: { field: string; direction: 1 | -1 }) => ({
      [opts.field]: opts.direction,
    })),
  }
})

// eslint-disable-next-line import/order
import { buildSortObject } from '../../../app/shared/repository'

type Quiz = {
  id: string
  title?: string
  created?: Date
  updated?: Date
  owner?: unknown
}

type QuizModel = {
  findById: jest.Mock
}

describe('QuizRepository', () => {
  let quizModel: QuizModel
  let repo: QuizRepository

  beforeEach(() => {
    jest.clearAllMocks()

    quizModel = {
      findById: jest.fn(),
    }

    // QuizRepository expects @InjectModel(Quiz.name) which is a Mongoose model.
    // For unit tests we only need the subset we use (findById + populate chain).
    repo = new QuizRepository(quizModel as unknown as never)
  })

  describe('findQuizByIdOrThrow', () => {
    it('returns the populated document when found', async () => {
      const quizId = 'quiz-1'
      const document = { id: quizId } as unknown as Quiz

      const populate = jest.fn().mockResolvedValue(document)
      quizModel.findById.mockReturnValue({ populate })

      await expect(repo.findQuizByIdOrThrow(quizId)).resolves.toBe(document)

      expect(quizModel.findById).toHaveBeenCalledTimes(1)
      expect(quizModel.findById).toHaveBeenCalledWith(quizId)

      expect(populate).toHaveBeenCalledTimes(1)
      expect(populate).toHaveBeenCalledWith('owner')
    })

    it('throws QuizNotFoundException when not found', async () => {
      const quizId = 'missing-quiz'

      const populate = jest.fn().mockResolvedValue(null)
      quizModel.findById.mockReturnValue({ populate })

      await expect(repo.findQuizByIdOrThrow(quizId)).rejects.toBeInstanceOf(
        QuizNotFoundException,
      )

      expect(quizModel.findById).toHaveBeenCalledWith(quizId)
      expect(populate).toHaveBeenCalledWith('owner')
    })
  })

  describe('countQuizzes', () => {
    it('delegates to BaseRepository.count with the provided filter', async () => {
      const filter = { owner: 'owner-1' }
      ;(repo as unknown as { count: jest.Mock }).count.mockResolvedValue(42)

      await expect(repo.countQuizzes(filter as never)).resolves.toBe(42)

      expect(
        (repo as unknown as { count: jest.Mock }).count,
      ).toHaveBeenCalledTimes(1)
      expect(
        (repo as unknown as { count: jest.Mock }).count,
      ).toHaveBeenCalledWith(filter)
    })
  })

  describe('findQuizzes', () => {
    it('uses defaults (sortField=created, sortOrder=desc, limit=10, offset=0) and returns documents', async () => {
      const filter = { owner: 'owner-1' }
      const documents: Quiz[] = [{ id: 'q1' }, { id: 'q2' }]

      ;(
        repo as unknown as { findWithPagination: jest.Mock }
      ).findWithPagination.mockResolvedValue({ documents })

      await expect(repo.findQuizzes(filter as never)).resolves.toEqual(
        documents,
      )

      expect(buildSortObject).toHaveBeenCalledTimes(1)
      expect(buildSortObject).toHaveBeenCalledWith({
        field: 'created',
        direction: -1,
      })

      expect(
        (repo as unknown as { findWithPagination: jest.Mock })
          .findWithPagination,
      ).toHaveBeenCalledTimes(1)

      expect(
        (repo as unknown as { findWithPagination: jest.Mock })
          .findWithPagination,
      ).toHaveBeenCalledWith(filter, {
        skip: 0,
        limit: 10,
        sort: { created: -1 },
        populate: 'owner',
      })
    })

    it('supports sorting ascending and custom pagination params', async () => {
      const filter = { title: /history/i }
      const documents: Quiz[] = [{ id: 'q10' }]

      ;(
        repo as unknown as { findWithPagination: jest.Mock }
      ).findWithPagination.mockResolvedValue({ documents })

      await expect(
        repo.findQuizzes(filter as never, 'title', 'asc', 25, 50),
      ).resolves.toEqual(documents)

      expect(buildSortObject).toHaveBeenCalledTimes(1)
      expect(buildSortObject).toHaveBeenCalledWith({
        field: 'title',
        direction: 1,
      })

      expect(
        (repo as unknown as { findWithPagination: jest.Mock })
          .findWithPagination,
      ).toHaveBeenCalledWith(filter, {
        skip: 50,
        limit: 25,
        sort: { title: 1 },
        populate: 'owner',
      })
    })
  })

  describe('createQuiz', () => {
    it('delegates to BaseRepository.create and returns the created document', async () => {
      const input: Partial<Quiz> = { title: 'My quiz' }
      const created = { id: 'new', title: 'My quiz' }

      ;(repo as unknown as { create: jest.Mock }).create.mockResolvedValue(
        created,
      )

      await expect(repo.createQuiz(input as never)).resolves.toBe(
        created as never,
      )

      expect(
        (repo as unknown as { create: jest.Mock }).create,
      ).toHaveBeenCalledTimes(1)
      expect(
        (repo as unknown as { create: jest.Mock }).create,
      ).toHaveBeenCalledWith(input)
    })
  })

  describe('updateQuiz', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-01-10T10:11:12.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('updates quiz and injects updated timestamp', async () => {
      const quizId = 'quiz-1'
      const patch: Partial<Quiz> = { title: 'Updated title' }
      const updatedDocument = { id: quizId, title: 'Updated title' }

      ;(repo as unknown as { update: jest.Mock }).update.mockResolvedValue(
        updatedDocument,
      )

      await expect(repo.updateQuiz(quizId, patch as never)).resolves.toBe(
        updatedDocument as never,
      )

      expect(
        (repo as unknown as { update: jest.Mock }).update,
      ).toHaveBeenCalledTimes(1)
      expect(
        (repo as unknown as { update: jest.Mock }).update,
      ).toHaveBeenCalledWith(
        quizId,
        {
          ...patch,
          updated: new Date('2026-01-10T10:11:12.000Z'),
        },
        { populate: { path: 'owner' } },
      )
    })

    it('throws QuizNotFoundException when BaseRepository.update returns null', async () => {
      const quizId = 'missing'
      const patch: Partial<Quiz> = { title: 'Does not matter' }

      ;(repo as unknown as { update: jest.Mock }).update.mockResolvedValue(null)

      await expect(
        repo.updateQuiz(quizId, patch as never),
      ).rejects.toBeInstanceOf(QuizNotFoundException)

      expect(
        (repo as unknown as { update: jest.Mock }).update,
      ).toHaveBeenCalledWith(
        quizId,
        {
          ...patch,
          updated: new Date('2026-01-10T10:11:12.000Z'),
        },
        { populate: { path: 'owner' } },
      )
    })
  })

  describe('deleteQuiz', () => {
    it('deletes quiz when BaseRepository.delete returns true', async () => {
      const quizId = 'quiz-1'
      ;(repo as unknown as { delete: jest.Mock }).delete.mockResolvedValue(true)

      await expect(repo.deleteQuiz(quizId)).resolves.toBeUndefined()

      expect(
        (repo as unknown as { delete: jest.Mock }).delete,
      ).toHaveBeenCalledTimes(1)
      expect(
        (repo as unknown as { delete: jest.Mock }).delete,
      ).toHaveBeenCalledWith(quizId)
    })

    it('throws QuizNotFoundException when BaseRepository.delete returns false', async () => {
      const quizId = 'missing'
      ;(repo as unknown as { delete: jest.Mock }).delete.mockResolvedValue(
        false,
      )

      await expect(repo.deleteQuiz(quizId)).rejects.toBeInstanceOf(
        QuizNotFoundException,
      )

      expect(
        (repo as unknown as { delete: jest.Mock }).delete,
      ).toHaveBeenCalledWith(quizId)
    })
  })
})
