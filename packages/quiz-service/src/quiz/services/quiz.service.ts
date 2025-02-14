import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  GameMode,
  LanguageCode,
  PaginatedQuizResponseDto,
  QuestionDto,
  QuestionMultiChoiceDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
  QuizRequestDto,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'
import { RootFilterQuery } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { Player } from '../../player/services/models/schemas'
import { QuizNotFoundException } from '../exceptions'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
  Quiz,
  QuizModel,
} from './models/schemas'
import { calculateRangeStep } from './utils'

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
   * Retrieves quizzes owned by a specific owner with pagination.
   *
   * @param ownerId - The ID of the owner whose quizzes are to be retrieved.
   * @param search - Optional search term to filter quizzes by title.
   * @param mode - Optional filter for the game mode of the quizzes.
   * @param visibility - The visibility setting of the quizzes (e.g., Public, Private).
   * @param languageCode - The language in which the quiz is written.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' for ascending, 'desc' for descending). Defaults to 'desc'.
   * @param limit - Maximum number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns {Promise<PaginatedQuizResponseDto>} A paginated response containing the quizzes and metadata.
   */
  public async findQuizzesByOwnerId(
    ownerId: string,
    search?: string,
    mode?: GameMode,
    visibility?: QuizVisibility,
    languageCode?: LanguageCode,
    sortField: 'title' | 'created' | 'updated' = 'created',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 10,
    offset: number = 0,
  ): Promise<PaginatedQuizResponseDto> {
    return this.findQuizzes(
      ownerId,
      search,
      mode,
      visibility,
      languageCode,
      sortField,
      sortOrder,
      limit,
      offset,
    )
  }

  /**
   * Retrieves a paginated list of public quizzes.
   *
   * This method fetches quizzes with public visibility, optionally filtered by
   * search terms or game mode. Results can also be sorted by specific fields
   * and ordered in ascending or descending order.
   *
   * @param search - Optional search term to filter quizzes by title.
   * @param mode - Optional filter for the game mode of the quizzes.
   * @param languageCode - The language in which the quiz is written.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' for ascending, 'desc' for descending). Defaults to 'desc'.
   * @param limit - Maximum number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns {Promise<PaginatedQuizResponseDto>} A paginated response containing the list of quizzes.
   */
  public async findPublicQuizzes(
    search?: string,
    mode?: GameMode,
    languageCode?: LanguageCode,
    sortField: 'title' | 'created' | 'updated' = 'created',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 10,
    offset: number = 0,
  ): Promise<PaginatedQuizResponseDto> {
    return this.findQuizzes(
      undefined,
      search,
      mode,
      QuizVisibility.Public,
      languageCode,
      sortField,
      sortOrder,
      limit,
      offset,
    )
  }

  /**
   * description here.
   *
   * @param ownerId - The ID of the owner whose quizzes are to be retrieved.
   * @param search - Optional search term to filter quizzes by title.
   * @param mode - Optional filter for the game mode of the quizzes.
   * @param visibility - The visibility setting of the quizzes (e.g., Public, Private).
   * @param languageCode - The language in which the quiz is written.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' for ascending, 'desc' for descending). Defaults to 'desc'.
   * @param limit - Maximum number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns {Promise<PaginatedQuizResponseDto>} A paginated response containing the list of quizzes.
   *
   * @private
   */
  private async findQuizzes(
    ownerId: string,
    search?: string,
    mode?: GameMode,
    visibility?: QuizVisibility,
    languageCode?: LanguageCode,
    sortField: 'title' | 'created' | 'updated' = 'created',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 10,
    offset: number = 0,
  ): Promise<PaginatedQuizResponseDto> {
    const filter: RootFilterQuery<Quiz> = {
      ...(ownerId ? { owner: ownerId } : {}),
      ...(search?.length ? { title: { $regex: search, $options: 'i' } } : {}),
      ...(mode ? { mode } : {}),
      ...(visibility ? { visibility } : {}),
      ...(languageCode ? { languageCode } : {}),
    }

    const total = await this.quizModel.countDocuments(filter)

    const quizzes = await this.quizModel
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limit)
      .populate('owner')

    return {
      results: quizzes.map(QuizService.buildQuizResponseDto),
      offset,
      limit,
      total,
    }
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
  public async findQuizDocumentByIdOrThrow(quizId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).populate('owner')

    if (!quiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    return quiz
  }

  /**
   * Retrieves all questions associated with a given quiz.
   *
   * @param {string} quizId - The unique identifier of the quiz.
   *
   * @returns {Promise<QuestionDto[]>} - A list of all questions associated with the specified quiz.
   *
   * @throws {QuizNotFoundException} - If the quiz with the given ID does not exist.
   */
  public async findAllQuestion(quizId: string): Promise<QuestionDto[]> {
    const quiz = await this.quizModel.findById(quizId).populate('owner')

    if (!quiz) {
      this.logger.warn(`Quiz was not found by id '${quizId}.`)
      throw new QuizNotFoundException(quizId)
    }

    return quiz.questions.map((question) =>
      QuizService.buildQuestionDto(quiz.mode, question),
    )
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
      mode: quizRequest.mode,
      visibility: quizRequest.visibility,
      category: quizRequest.category,
      imageCoverURL: quizRequest.imageCoverURL,
      languageCode: quizRequest.languageCode,
      questions: QuizService.buildQuizQuestions(quizRequest),
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
      mode: quizRequest.mode,
      visibility: quizRequest.visibility,
      category: quizRequest.category,
      imageCoverURL: quizRequest.imageCoverURL,
      languageCode: quizRequest.languageCode,
      questions: QuizService.buildQuizQuestions(quizRequest),
      updated: new Date(),
    }
  }

  /**
   * Builds the Mongoose-compatible documents for the questions.
   *
   * @param {QuizRequestDto} quizRequest - The data for the question.
   *
   * @returns {QuestionDao} - The constructed question documents.
   * @private
   */
  private static buildQuizQuestions(
    quizRequest: QuizRequestDto,
  ): QuestionDao[] {
    if (quizRequest.mode === GameMode.Classic) {
      return quizRequest.questions.map((question) => {
        const common: Partial<BaseQuestionDao> = {
          type: question.type,
          text: question.question,
          media: question.media,
          points: question.points,
          duration: question.duration,
        }

        switch (question.type) {
          case QuestionType.MultiChoice:
            return {
              ...common,
              ...({
                type: QuestionType.MultiChoice,
                options: question.options,
              } as BaseQuestionDao & QuestionMultiChoiceDao),
            }
          case QuestionType.Range:
            return {
              ...common,
              ...({
                type: QuestionType.Range,
                min: question.min,
                max: question.max,
                step: calculateRangeStep(question.min, question.max),
                correct: question.correct,
                margin: question.margin,
              } as BaseQuestionDao & QuestionRangeDao),
            }
          case QuestionType.TrueFalse:
            return {
              ...common,
              ...({
                type: QuestionType.TrueFalse,
                correct: question.correct,
              } as BaseQuestionDao & QuestionTrueFalseDao),
            }
          case QuestionType.TypeAnswer:
            return {
              ...common,
              ...({
                type: QuestionType.TypeAnswer,
                options: question.options,
              } as BaseQuestionDao & QuestionTypeAnswerDao),
            }
        }
      })
    }

    if (quizRequest.mode === GameMode.ZeroToOneHundred) {
      return quizRequest.questions.map((question) => {
        return {
          type: QuestionType.Range,
          text: question.question,
          media: question.media,
          min: 0,
          max: 100,
          step: 1,
          correct: question.correct,
          margin: QuestionRangeAnswerMargin.None,
          points: 0,
          duration: question.duration,
        } as BaseQuestionDao & QuestionRangeDao
      })
    }
  }

  /**
   * Constructs a `QuestionDto` object from a Mongoose `Question` document.
   *
   * @param {GameMode} mode - The game mode of the quiz.
   * @param {BaseQuestionDao} question - The Mongoose question document to transform.
   *
   * @returns {QuestionDto} - The constructed DTO representing the question details.
   * @private
   */
  private static buildQuestionDto(
    mode: GameMode,
    question: BaseQuestionDao,
  ): QuestionDto {
    const { type, text, media, points, duration } = question

    if (mode === GameMode.Classic) {
      const common: Partial<QuestionDto> = {
        type,
        question: text,
        media,
        points,
        duration,
      }

      switch (type) {
        case QuestionType.MultiChoice: {
          const cast = question as BaseQuestionDao & QuestionMultiChoiceDao
          return {
            ...common,
            type: QuestionType.MultiChoice,
            options: cast.options,
          } as QuestionMultiChoiceDto
        }
        case QuestionType.Range: {
          const cast = question as BaseQuestionDao & QuestionRangeDao
          return {
            ...common,
            type: QuestionType.Range,
            min: cast.min,
            max: cast.max,
            correct: cast.correct,
            margin: cast.margin,
          } as QuestionRangeDto
        }
        case QuestionType.TrueFalse: {
          const cast = question as BaseQuestionDao & QuestionTrueFalseDao
          return {
            ...common,
            type: QuestionType.TrueFalse,
            correct: cast.correct,
          } as QuestionTrueFalseDto
        }
        case QuestionType.TypeAnswer: {
          const cast = question as BaseQuestionDao & QuestionTypeAnswerDao
          return {
            ...common,
            type: QuestionType.TypeAnswer,
            options: cast.options,
          } as QuestionTypeAnswerDto
        }
      }
    }

    if (mode === GameMode.ZeroToOneHundred) {
      const cast = question as BaseQuestionDao & QuestionRangeDao
      return {
        type,
        question: text,
        media,
        duration,
        correct: cast.correct,
      } as QuestionZeroToOneHundredRangeDto
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
      mode,
      visibility,
      category,
      imageCoverURL,
      languageCode,
      questions,
      owner,
      created,
      updated,
    } = quiz
    return {
      id,
      title,
      description,
      mode,
      visibility,
      category,
      imageCoverURL,
      languageCode,
      numberOfQuestions: questions.length,
      author: {
        id: owner._id,
        name: owner.nickname,
      },
      created,
      updated,
    }
  }
}
