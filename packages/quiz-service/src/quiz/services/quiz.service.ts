import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { QuizRequestDto, QuizResponseDto } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { Player } from '../../player/services/models/schemas'
import { QuizNotFoundException } from '../exceptions'

import { Quiz, QuizModel } from './models/schemas'

/**
 * Service for managing quiz-related operations.
 */
@Injectable()
export class QuizService {
  /**
   * Initializes the QuizService.
   *
   * @param {QuizModel} quizModel - The Mongoose model for quizzes.
   * @param {Logger} logger - Logger instance for logging operations.
   */
  constructor(
    @InjectModel(Quiz.name) private quizModel: QuizModel,
    private readonly logger: Logger = new Logger(QuizService.name),
  ) {}

  /**
   * Creates a new quiz.
   *
   * @param {QuizRequestDto} quizRequest - The data for the quiz to be created.
   * @param {Player} player - The player creating the quiz.
   *
   * @returns {Promise<QuizResponseDto>} - The created quiz's details.
   */
  public async createQuiz(
    quizRequest: QuizRequestDto,
    player: Player,
  ): Promise<QuizResponseDto> {
    const quiz = await this.quizModel.create(
      QuizService.buildNewQuiz(quizRequest, player),
    )

    this.logger.log(`Created quiz with id '${quiz._id}.'`)

    return QuizService.buildQuizResponseDto(quiz)
  }

  /**
   * Finds a quiz by its ID.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   *
   * @returns {Promise<QuizResponseDto>} - The details of the found quiz.
   *
   * @throws {QuizNotFoundException} - If no quiz is found with the given ID.
   */
  public async findQuizById(quizId: string): Promise<QuizResponseDto> {
    const quiz = await this.findQuizDocumentByIdOrThrow(quizId)
    return QuizService.buildQuizResponseDto(quiz)
  }

  /**
   * Retrieves the owner of a quiz by its ID.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   *
   * @returns {Promise<Player>} - The owner of the quiz.
   *
   * @throws {QuizNotFoundException} - If no quiz is found with the given ID.
   */
  public async findOwnerByQuizId(quizId: string): Promise<Player> {
    const quiz = await this.findQuizDocumentByIdOrThrow(quizId)
    return quiz.owner
  }

  /**
   * Updates an existing quiz.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   * @param {QuizRequestDto} quizRequest - The updated quiz data.
   *
   * @returns {Promise<QuizResponseDto>} - The updated quiz's details.
   *
   * @throws {QuizNotFoundException} - If no quiz is found with the given ID.
   */
  public async updateQuiz(
    quizId: string,
    quizRequest: QuizRequestDto,
  ): Promise<QuizResponseDto> {
    const updatedQuiz = await this.quizModel.findByIdAndUpdate(
      quizId,
      QuizService.buildUpdatedQuiz(quizRequest),
      { new: true },
    )

    if (!updatedQuiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    this.logger.log(`Updated quiz with id '${quizId}.'`)

    return QuizService.buildQuizResponseDto(updatedQuiz)
  }

  /**
   * Deletes a quiz by its ID.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   *
   * @returns {Promise<void>} - Confirms successful deletion of the quiz.
   *
   * @throws {QuizNotFoundException} - If no quiz is found with the given ID.
   */
  public async deleteQuiz(quizId: string): Promise<void> {
    const deletedQuiz = await this.quizModel.findByIdAndDelete(quizId)

    if (!deletedQuiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }
  }

  /**
   * Finds a quiz document by its ID or throws an exception if not found.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   *
   * @returns {Promise<Quiz>} - The found quiz document.
   *
   * @throws {QuizNotFoundException} - If no quiz is found with the given ID.
   */
  private async findQuizDocumentByIdOrThrow(quizId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).populate('owner')

    if (!quiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    return quiz
  }

  /**
   * Builds a new quiz document based on the request data and player.
   *
   * @param {QuizRequestDto} quizRequest - The data for the quiz to be created.
   * @param {Player} player - The player creating the quiz.
   *
   * @returns {Quiz} - The constructed quiz document.
   * @private
   */
  private static buildNewQuiz(
    quizRequest: QuizRequestDto,
    player: Player,
  ): Quiz {
    const created = new Date()
    return {
      _id: uuidv4(),
      title: quizRequest.title,
      description: quizRequest.description,
      visibility: quizRequest.visibility,
      imageCoverURL: quizRequest.imageCoverURL,
      languageCode: quizRequest.languageCode,
      owner: player,
      created,
      updated: created,
    }
  }

  /**
   * Builds the data for updating a quiz.
   *
   * @param {QuizRequestDto} quizRequest - The updated quiz data.
   *
   * @returns {Partial<Quiz>} - The updated quiz data to persist.
   * @private
   */
  private static buildUpdatedQuiz(quizRequest: QuizRequestDto): Partial<Quiz> {
    return {
      title: quizRequest.title,
      description: quizRequest.description,
      visibility: quizRequest.visibility,
      imageCoverURL: quizRequest.imageCoverURL,
      languageCode: quizRequest.languageCode,
      updated: new Date(),
    }
  }

  /**
   * Builds a QuizResponseDto from a Quiz document.
   *
   * @param {Quiz} quiz - The quiz document.
   *
   * @returns {QuizResponseDto} - The constructed response DTO.
   * @private
   */
  private static buildQuizResponseDto(quiz: Quiz): QuizResponseDto {
    const {
      _id: id,
      title,
      description,
      visibility,
      imageCoverURL,
      languageCode,
      created,
      updated,
    } = quiz
    return {
      id,
      title,
      description,
      visibility,
      imageCoverURL,
      languageCode,
      created,
      updated,
    }
  }
}
