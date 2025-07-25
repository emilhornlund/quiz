import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { RootFilterQuery } from 'mongoose'

import { QuizNotFoundException } from '../exceptions'

import { Quiz, QuizModel } from './models/schemas'

/**
 * Repository for accessing and manipulating quiz data.
 *
 * Provides methods to query, create, update, and delete quizzes using the Mongoose model.
 */
@Injectable()
export class QuizRepository {
  // Logger for logging repository operations
  private logger: Logger = new Logger(QuizRepository.name)

  /**
   * Creates an instance of QuizRepository.
   *
   * @param quizModel - The Mongoose model for the Quiz schema.
   */
  constructor(@InjectModel(Quiz.name) private quizModel: QuizModel) {}

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
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
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
    return this.quizModel.countDocuments(filter)
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
    return this.quizModel
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limit)
      .populate('owner')
  }

  /**
   * Creates a new quiz document.
   *
   * @param quiz - The quiz document to create.
   *
   * @returns The created quiz document.
   */
  public async createQuiz(quiz: Quiz): Promise<Quiz> {
    const document = await this.quizModel.create(quiz)

    this.logger.log(`Created quiz with id '${quiz._id}.'`)

    return document
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
    const document = await this.quizModel.findByIdAndUpdate(
      quizId,
      { ...quiz, updated: new Date() },
      {
        new: true,
      },
    )

    if (!document) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    this.logger.log(`Updated quiz with id '${quizId}.'`)

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
    const document = await this.quizModel.findByIdAndDelete(quizId)

    if (!document) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    this.logger.log(`Deleted quiz by id '${quizId}'.`)
  }
}
