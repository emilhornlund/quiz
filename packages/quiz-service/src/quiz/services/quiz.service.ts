import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  GameMode,
  LanguageCode,
  PaginatedQuizResponseDto,
  QuestionDto,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPuzzleDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
  QuizCategory,
  QuizRequestDto,
  QuizResponseDto,
  QuizVisibility,
} from '@quiz/common'
import { RootFilterQuery } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { User } from '../../user/repositories'
import { QuizRepository } from '../repositories'
import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionPinDao,
  QuestionPuzzleDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
  Quiz,
} from '../repositories/models/schemas'

import { calculateRangeStep } from './utils'

/**
 * Service for managing quiz-related operations.
 */
@Injectable()
export class QuizService {
  /**
   * Initializes the QuizService.
   *
   * @param quizRepository - Repository for accessing and modifying quiz documents.
   * @param eventEmitter - Emits domain events (e.g., when a quiz is deleted).
   * @param logger - Logger instance for logging operations.
   */
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger = new Logger(QuizService.name),
  ) {}

  /**
   * Creates a new quiz.
   *
   * @param quizRequest - The data for the quiz to be created.
   * @param user - The user creating the quiz.
   *
   * @returns The created quiz's details.
   */
  public async createQuiz(
    quizRequest: QuizRequestDto,
    user: User,
  ): Promise<QuizResponseDto> {
    const document = await this.quizRepository.createQuiz(
      QuizService.buildNewQuiz(quizRequest, user),
    )

    this.logger.log(`Created quiz with id '${document._id}.'`)

    return QuizService.buildQuizResponseDto(document)
  }

  /**
   * Finds a quiz by its ID.
   *
   * @param quizId - The unique identifier of the quiz.
   *
   * @returns The details of the found quiz.
   *
   * @throws QuizNotFoundException If no quiz is found with the given ID.
   */
  public async findQuizById(quizId: string): Promise<QuizResponseDto> {
    const quiz = await this.quizRepository.findQuizByIdOrThrow(quizId)
    return QuizService.buildQuizResponseDto(quiz)
  }

  /**
   * Retrieves quizzes owned by a specific owner with pagination.
   *
   * @param ownerId - The ID of the owner whose quizzes are to be retrieved.
   * @param search - Optional search term to filter quizzes by title.
   * @param mode - Optional filter for the game mode of the quizzes.
   * @param visibility - The visibility setting of the quizzes (e.g., Public, Private).
   * @param category - The category assigned to the quiz (e.g., Science, History).
   * @param languageCode - The language in which the quiz is written.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' for ascending, 'desc' for descending). Defaults to 'desc'.
   * @param limit - Maximum number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns A paginated response containing the quizzes and metadata.
   */
  public async findQuizzesByOwnerId(
    ownerId: string,
    search?: string,
    mode?: GameMode,
    visibility?: QuizVisibility,
    category?: QuizCategory,
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
      category,
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
   * @param category - The category assigned to the quiz (e.g., Science, History).
   * @param languageCode - The language in which the quiz is written.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' for ascending, 'desc' for descending). Defaults to 'desc'.
   * @param limit - Maximum number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns A paginated response containing the list of quizzes.
   */
  public async findPublicQuizzes(
    search?: string,
    mode?: GameMode,
    category?: QuizCategory,
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
      category,
      languageCode,
      sortField,
      sortOrder,
      limit,
      offset,
    )
  }

  /**
   * Finds quizzes using filter, sorting, pagination.
   *
   * @param ownerId - The ID of the owner whose quizzes are to be retrieved.
   * @param search - Optional search term to filter quizzes by title.
   * @param mode - Optional filter for the game mode of the quizzes.
   * @param visibility - The visibility setting of the quizzes (e.g., Public, Private).
   * @param category - The category assigned to the quiz (e.g., Science, History).
   * @param languageCode - The language in which the quiz is written.
   * @param sortField - Field by which to sort the results. Defaults to 'created'.
   * @param sortOrder - Sort order ('asc' for ascending, 'desc' for descending). Defaults to 'desc'.
   * @param limit - Maximum number of quizzes to retrieve. Defaults to 10.
   * @param offset - Number of quizzes to skip for pagination. Defaults to 0.
   *
   * @returns A paginated response containing the list of quizzes.
   *
   * @private
   */
  private async findQuizzes(
    ownerId: string,
    search?: string,
    mode?: GameMode,
    visibility?: QuizVisibility,
    category?: QuizCategory,
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
      ...(category ? { category } : {}),
      ...(languageCode ? { languageCode } : {}),
    }

    const total = await this.quizRepository.countQuizzes(filter)

    const quizzes = await this.quizRepository.findQuizzes(
      filter,
      sortField,
      sortOrder,
      limit,
      offset,
    )

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
   * @param quizId - The unique identifier of the quiz.
   * @param quizRequest - The updated quiz data.
   *
   * @returns The updated quiz's details.
   *
   * @throws QuizNotFoundException If no quiz is found with the given ID.
   */
  public async updateQuiz(
    quizId: string,
    quizRequest: QuizRequestDto,
  ): Promise<QuizResponseDto> {
    const updatedQuiz = await this.quizRepository.updateQuiz(
      quizId,
      QuizService.buildUpdatedQuiz(quizRequest),
    )

    return QuizService.buildQuizResponseDto(updatedQuiz)
  }

  /**
   * Deletes a quiz by its ID.
   *
   * @param quizId - The unique identifier of the quiz.
   *
   * @returns Confirms successful deletion of the quiz.
   *
   * @throws QuizNotFoundException If no quiz is found with the given ID.
   */
  public async deleteQuiz(quizId: string): Promise<void> {
    await this.quizRepository.deleteQuiz(quizId)
    this.eventEmitter.emit('quiz.deleted', { quizId })
  }

  /**
   * Retrieves all questions associated with a given quiz.
   *
   * @param quizId - The unique identifier of the quiz.
   *
   * @returns A list of all questions associated with the specified quiz.
   *
   * @throws If the quiz with the given ID does not exist.
   */
  public async findAllQuestion(quizId: string): Promise<QuestionDto[]> {
    const quiz = await this.quizRepository.findQuizByIdOrThrow(quizId)

    return quiz.questions.map((question) =>
      QuizService.buildQuestionDto(quiz.mode, question),
    )
  }

  /**
   * Builds a new quiz document based on the request data and user.
   *
   * @param quizRequest - The data for the quiz to be created.
   * @param user - The user creating the quiz.
   *
   * @returns The constructed quiz document.
   * @private
   */
  private static buildNewQuiz(quizRequest: QuizRequestDto, user: User): Quiz {
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
      owner: user,
      created,
      updated: created,
    }
  }

  /**
   * Builds the data for updating a quiz.
   *
   * @param quizRequest - The updated quiz data.
   *
   * @returns The updated quiz data to persist.
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
   * @param quizRequest - The data for the question.
   *
   * @returns The constructed question documents.
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
          points: question.points,
          duration: question.duration,
        }

        switch (question.type) {
          case QuestionType.MultiChoice:
            return {
              ...common,
              ...({
                type: QuestionType.MultiChoice,
                media: question.media,
                options: question.options,
              } as BaseQuestionDao & QuestionMultiChoiceDao),
            }
          case QuestionType.Range:
            return {
              ...common,
              ...({
                type: QuestionType.Range,
                media: question.media,
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
                media: question.media,
                correct: question.correct,
              } as BaseQuestionDao & QuestionTrueFalseDao),
            }
          case QuestionType.TypeAnswer:
            return {
              ...common,
              ...({
                type: QuestionType.TypeAnswer,
                media: question.media,
                options: question.options,
              } as BaseQuestionDao & QuestionTypeAnswerDao),
            }
          case QuestionType.Pin:
            return {
              ...common,
              ...{
                type: QuestionType.Pin,
                media: undefined,
                imageURL: question.imageURL,
                positionX: question.positionX,
                positionY: question.positionY,
                tolerance: question.tolerance,
              },
            } as BaseQuestionDao & QuestionPinDao
          case QuestionType.Puzzle:
            return {
              ...common,
              ...{
                type: QuestionType.Puzzle,
                media: question.media,
                values: question.values,
              },
            } as BaseQuestionDao & QuestionPuzzleDao
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
   * @param mode - The game mode of the quiz.
   * @param question - The Mongoose question document to transform.
   *
   * @returns The constructed DTO representing the question details.
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
        case QuestionType.Pin: {
          const cast = question as BaseQuestionDao & QuestionPinDao
          return {
            ...common,
            type: QuestionType.Pin,
            imageURL: cast.imageURL,
            positionX: cast.positionX,
            positionY: cast.positionY,
            tolerance: cast.tolerance,
          } as QuestionPinDto
        }
        case QuestionType.Puzzle: {
          const cast = question as BaseQuestionDao & QuestionPuzzleDao
          return {
            ...common,
            type: QuestionType.Puzzle,
            values: cast.values,
          } as QuestionPuzzleDto
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
   * @param quiz - The quiz document.
   *
   * @returns The constructed response DTO.
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
        name: owner.defaultNickname,
      },
      created,
      updated,
    }
  }
}
