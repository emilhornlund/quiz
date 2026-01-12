import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { QueryFilter } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { BaseRepository, buildSortObject } from '../../../app/shared/repository'
import { User } from '../../user/repositories'

import { QuizRating, type QuizRatingModel } from './models/schemas'

/**
 * Repository for managing quiz rating documents.
 *
 * Provides persistence operations for creating, updating, and listing ratings,
 * including pagination and sorting for quiz feedback feeds.
 */
@Injectable()
export class QuizRatingRepository extends BaseRepository<QuizRating> {
  /**
   * Creates a `QuizRatingRepository`.
   *
   * @param quizRatingModel - The Mongoose model for the QuizRating schema.
   */
  constructor(
    @InjectModel(QuizRating.name)
    protected readonly quizRatingModel: QuizRatingModel,
  ) {
    super(quizRatingModel, 'QuizRating')
  }

  /**
   * Finds a user's rating for a specific quiz.
   *
   * @param quizId - The quiz identifier.
   * @param author - The author (user) who created the rating.
   * @returns The rating document if found, otherwise `null`.
   */
  public async findQuizRatingByAuthor(
    quizId: string,
    author: User,
  ): Promise<QuizRating | null> {
    return this.findOne({ quizId, author })
  }

  /**
   * Finds ratings for a quiz with pagination and sorting.
   *
   * Ratings are populated with the author reference to support displaying
   * nickname information in the UI.
   *
   * @param quizId - The quiz identifier.
   * @param options - Pagination and sorting options.
   * @returns A paginated result containing rating documents and metadata.
   */
  public async findQuizRatingsWithPagination(
    quizId: string,
    options: {
      offset?: number
      limit?: number
      sort?: {
        field?: 'created' | 'updated'
        order?: 'asc' | 'desc'
      }
      /**
       * When true, only ratings that include a non-empty comment are returned.
       * Useful for a “Latest feedback” feed.
       */
      commentsOnly?: boolean
    },
  ): Promise<{
    results: QuizRating[]
    total: number
    limit: number
    offset: number
  }> {
    const filter: QueryFilter<QuizRating> = {
      quizId,
      ...(options.commentsOnly ? { comment: { $exists: true, $ne: '' } } : {}),
    }

    const sort = buildSortObject({
      field: options?.sort?.field ?? 'updated',
      direction: (options?.sort?.order ?? 'asc') === 'asc' ? 1 : -1,
    })

    const findOptions = {
      skip: options?.offset ?? 0,
      limit: options?.limit ?? 5,
      sort,
      populate: 'author',
    }

    const result = await this.findWithPagination(filter, findOptions)

    return {
      results: result.documents,
      total: result.total,
      limit: findOptions.limit,
      offset: findOptions.skip,
    }
  }

  /**
   * Creates a new rating document for a quiz.
   *
   * Note: uniqueness is enforced by the `(quizId, author)` unique index.
   *
   * @param quizId - The quiz identifier.
   * @param author - The user creating the rating.
   * @param now - Timestamp used for both `created` and `updated`.
   * @param stars - Star rating value (1–5).
   * @param comment - Optional feedback comment.
   * @returns The created rating document.
   */
  public async createQuizRating(
    quizId: string,
    author: User,
    now: Date,
    stars: number,
    comment?: string,
  ): Promise<QuizRating> {
    return this.create({
      _id: uuidv4(),
      quizId,
      author,
      stars,
      comment,
      created: now,
      updated: now,
    })
  }

  /**
   * Updates an existing rating document.
   *
   * @param quizRatingId - The rating identifier.
   * @param now - Timestamp used for the new `updated` value.
   * @param stars - Updated star rating value (1–5).
   * @param comment - Updated feedback comment.
   * @returns The updated rating document.
   * @throws QuizRatingNotFoundException when the rating does not exist.
   */
  public async updateQuizRating(
    quizRatingId: string,
    now: Date,
    stars: number,
    comment?: string,
  ): Promise<QuizRating | null> {
    return this.update(
      quizRatingId,
      { stars, comment, updated: now },
      { populate: { path: 'author' } },
    )
  }
}
