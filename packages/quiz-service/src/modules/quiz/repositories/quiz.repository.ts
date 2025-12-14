import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { RootFilterQuery } from 'mongoose'

import {
  BaseRepository,
  buildSortObject,
  SortOptions,
} from '../../../app/shared/repository'
import { QuizNotFoundException } from '../exceptions'

import { Quiz, QuizModel } from './models/schemas'

/**
 * Repository for accessing and manipulating quiz data.
 *
 * Extends BaseRepository to provide common CRUD operations and adds quiz-specific methods.
 */
@Injectable()
export class QuizRepository extends BaseRepository<Quiz> {
  /**
   * Creates an instance of QuizRepository.
   *
   * @param quizModel - The Mongoose model for the Quiz schema.
   */
  constructor(@InjectModel(Quiz.name) protected readonly quizModel: QuizModel) {
    super(quizModel, 'Quiz')
  }

  /**
   * Finds a quiz document by its ID or throws an exception if not found.
   *
   * @param quizId - The unique identifier of the quiz.
   *
   * @returns The found quiz document.
   *
   * @throws QuizNotFoundException If no quiz is found with the given ID.
   */
  public async findQuizByIdOrThrow(quizId: string): Promise<Quiz> {
    const document = await this.quizModel.findById(quizId).populate('owner')

    if (!document) {
      throw new QuizNotFoundException(quizId)
    }

    return document
  }

  /**
   * Counts quizzes that match the provided filter.
   *
   * @param filter - The Mongoose filter query to apply.
   *
   * @returns The total number of quizzes that match the filter.
   */
  public async countQuizzes(filter: RootFilterQuery<Quiz>): Promise<number> {
    return this.count(filter)
  }

  /**
   * Finds quizzes using filter, sorting, pagination.
   *
   * @param filter - Filter criteria for matching quizzes.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' | 'desc'). Defaults to 'desc'.
   * @param limit - Max number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns List of matching quizzes.
   */
  public async findQuizzes(
    filter: RootFilterQuery<Quiz>,
    sortField: 'title' | 'created' | 'updated' = 'created',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 10,
    offset: number = 0,
  ): Promise<Quiz[]> {
    const sortOptions: SortOptions = {
      field: sortField,
      direction: sortOrder === 'asc' ? 1 : -1,
    }

    const result = await this.findWithPagination(filter, {
      skip: offset,
      limit,
      sort: buildSortObject(sortOptions),
      populate: 'owner',
    })

    return result.documents
  }

  /**
   * Creates a new quiz document.
   *
   * @param quiz - The quiz document to create.
   *
   * @returns The created quiz document.
   */
  public async createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
    return this.create(quiz)
  }

  /**
   * Updates an existing quiz by ID.
   *
   * @param quizId - The unique identifier of the quiz to update.
   * @param quiz - Partial quiz data to update.
   *
   * @returns The updated quiz document.
   *
   * @throws QuizNotFoundException If no quiz is found with the given ID.
   */
  public async updateQuiz(quizId: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const document = await this.update(quizId, { ...quiz, updated: new Date() })

    if (!document) {
      throw new QuizNotFoundException(quizId)
    }

    return document
  }

  /**
   * Deletes a quiz by ID.
   *
   * @param quizId - The unique identifier of the quiz to delete.
   *
   * @throws QuizNotFoundException If no quiz is found with the given ID.
   */
  public async deleteQuiz(quizId: string): Promise<void> {
    const deleted = await this.delete(quizId)

    if (!deleted) {
      throw new QuizNotFoundException(quizId)
    }
  }

  /**
   * Updates the owner field on all quizzes from one user to another.
   *
   * @param fromUserId  The ID of the current quiz owner.
   * @param toUserId    The ID of the new quiz owner.
   * @returns A Promise that resolves once all matching quizzes have been updated.
   */
  public async updateQuizOwner(
    fromUserId: string,
    toUserId: string,
  ): Promise<void> {
    try {
      await this.updateMany(
        { owner: fromUserId },
        { $set: { owner: toUserId } },
      )
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.warn(
        `Unable update quiz owner from '${fromUserId} to '${toUserId}': ${message}`,
        stack,
      )
      throw error
    }
  }
}
