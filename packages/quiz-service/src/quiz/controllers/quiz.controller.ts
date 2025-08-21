import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { Authority, TokenScope } from '@quiz/common'

import {
  Principal,
  RequiredAuthorities,
  RequiresScopes,
} from '../../auth/controllers/decorators'
import { User } from '../../user/repositories'
import { ParseQuizRequestPipe } from '../pipes'
import { QuizService } from '../services'

import { ApiQuizIdParam } from './decorators/api'
import { AuthorizedQuiz } from './decorators/auth'
import { RouteQuizIdParam } from './decorators/params'
import {
  PaginatedQuizResponse,
  PublicQuizPageFilter,
  QuestionMultiChoice,
  QuestionPin,
  QuestionPuzzle,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  QuestionZeroToOneHundredRange,
  QuizClassicRequest,
  QuizResponse,
  QuizZeroToOneHundredRequest,
} from './models'
import { QuestionResponseMultiChoiceExample } from './utils/question-examples.utils'

/**
 * Controller for managing quiz-related operations.
 */
@ApiBearerAuth()
@ApiTags('quiz')
@ApiExtraModels(
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  QuestionPin,
  QuestionPuzzle,
  QuestionZeroToOneHundredRange,
  QuizClassicRequest,
  QuizZeroToOneHundredRequest,
)
@RequiresScopes(TokenScope.User)
@RequiredAuthorities(Authority.Quiz)
@Controller('quizzes')
export class QuizController {
  /**
   * Initializes the QuizController.
   *
   * @param quizService - Service for managing quiz operations.
   */
  constructor(private readonly quizService: QuizService) {}

  /**
   * Creates a new quiz and associates it with the authenticated user.
   *
   * @param user - The user initiating the request.
   * @param quizRequest - The details of the quiz to create.
   *
   * @returns The newly created quiz.
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new quiz',
    description:
      'Creates a new quiz and associates it with the authenticated user.',
  })
  @ApiBody({
    description: 'Request body for creating a new game.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(QuizClassicRequest) },
        { $ref: getSchemaPath(QuizZeroToOneHundredRequest) },
      ],
    },
  })
  @ApiCreatedResponse({
    description: 'Successfully created the quiz.',
    type: QuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @HttpCode(HttpStatus.CREATED)
  public async createQuiz(
    @Principal() user: User,
    @Body(new ParseQuizRequestPipe())
    quizRequest: QuizClassicRequest | QuizZeroToOneHundredRequest,
  ): Promise<QuizResponse> {
    return this.quizService.createQuiz(quizRequest, user)
  }

  /**
   * Retrieves a paginated list of public quizzes.
   *
   * This endpoint allows users to retrieve a list of quizzes that are publicly
   * available. Quizzes can be optionally filtered by search terms and sorted
   * by specific fields.
   *
   * @param queryParams - The filter, sorting, and pagination options for retrieving quizzes.
   *
   * @returns {Promise<PaginatedQuizResponse>} A paginated response containing
   * the list of public quizzes.
   */
  @Get()
  @ApiOperation({
    summary: 'Retrieve public quizzes',
    description:
      'Retrieves a paginated list of public quizzes. Supports filtering, sorting, and pagination.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the paginated list of public quizzes.',
    type: PaginatedQuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @HttpCode(HttpStatus.OK)
  public async getPublicQuizzes(
    @Query(new ValidationPipe({ transform: true }))
    queryParams: PublicQuizPageFilter,
  ): Promise<PaginatedQuizResponse> {
    return this.quizService.findPublicQuizzes(
      queryParams.search,
      queryParams.mode,
      queryParams.category,
      queryParams.languageCode,
      queryParams.sort,
      queryParams.order,
      queryParams.limit,
      queryParams.offset,
    )
  }

  /**
   * Retrieves a quiz by its unique ID.
   *
   * @param {string} quizId - The ID of the quiz to retrieve.
   *
   * @returns {Promise<QuizResponse>} The requested quiz.
   */
  @Get(':quizId')
  @AuthorizedQuiz({ allowPublic: true })
  @ApiOperation({
    summary: 'Retrieve a quiz',
    description: 'Retrieves an existing quiz by its unique ID.',
  })
  @ApiQuizIdParam()
  @ApiOkResponse({
    description: 'Successfully retrieved the quiz.',
    type: QuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The user does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @HttpCode(HttpStatus.OK)
  public async getQuiz(
    @RouteQuizIdParam() quizId: string,
  ): Promise<QuizResponse> {
    return this.quizService.findQuizById(quizId)
  }

  /**
   * Updates an existing quiz by its unique ID with new details.
   *
   * @param {string} quizId - The ID of the quiz to update.
   * @param {QuizClassicRequest | QuizZeroToOneHundredRequest} quizRequest - The details of the quiz to update.
   *
   * @returns {Promise<QuizResponse>} The updated quiz.
   */
  @Put(':quizId')
  @AuthorizedQuiz()
  @ApiOperation({
    summary: 'Update a quiz',
    description: 'Updates an existing quiz by its unique ID with new details.',
  })
  @ApiQuizIdParam()
  @ApiBody({
    description: 'Request body for creating a new game.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(QuizClassicRequest) },
        { $ref: getSchemaPath(QuizZeroToOneHundredRequest) },
      ],
    },
  })
  @ApiOkResponse({
    description: 'Successfully updated the quiz.',
    type: QuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The user does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @HttpCode(HttpStatus.OK)
  public async updateQuiz(
    @RouteQuizIdParam() quizId: string,
    @Body(new ParseQuizRequestPipe())
    quizRequest: QuizClassicRequest | QuizZeroToOneHundredRequest,
  ): Promise<QuizResponse> {
    return this.quizService.updateQuiz(quizId, quizRequest)
  }

  /**
   * Deletes an existing quiz by its unique ID.
   *
   * @param {string} quizId - The ID of the quiz to delete.
   *
   * @returns {Promise<void>} An empty response upon successful deletion.
   */
  @Delete(':quizId')
  @AuthorizedQuiz()
  @ApiOperation({
    summary: 'Delete a quiz',
    description: 'Deletes an existing quiz by its unique ID.',
  })
  @ApiQuizIdParam()
  @ApiOkResponse({
    description: 'Successfully deleted the quiz.',
    type: QuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The user does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteQuiz(@RouteQuizIdParam() quizId: string): Promise<void> {
    return this.quizService.deleteQuiz(quizId)
  }

  /**
   * Retrieves all questions for a specific quiz.
   *
   * This endpoint fetches all the questions associated with the specified quiz.
   * The response includes details for each question, including its type and specific properties.
   *
   * @param {string} quizId - The unique identifier of the quiz for which to retrieve questions.
   *
   * @returns {Promise<(QuestionMultiChoice | QuestionRange | QuestionZeroToOneHundredRange | QuestionTrueFalse | QuestionTypeAnswer | QuestionPin | QuestionPuzzle)[]>} - An array of questions associated with the specified quiz.
   */
  @Get('/:quizId/questions')
  @AuthorizedQuiz()
  @ApiOperation({
    summary: 'Retrieve all quiz questions',
    description:
      'Fetches all the questions associated with the specified quiz.',
  })
  @ApiQuizIdParam()
  @ApiOkResponse({
    description: 'Successfully retrieved the questions.',
    schema: {
      type: 'array',
      items: {
        oneOf: [
          { $ref: getSchemaPath(QuestionMultiChoice) },
          { $ref: getSchemaPath(QuestionRange) },
          { $ref: getSchemaPath(QuestionZeroToOneHundredRange) },
          { $ref: getSchemaPath(QuestionTrueFalse) },
          { $ref: getSchemaPath(QuestionTypeAnswer) },
          { $ref: getSchemaPath(QuestionPin) },
          { $ref: getSchemaPath(QuestionPuzzle) },
        ],
      },
    },
    example: [QuestionResponseMultiChoiceExample],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The ser does not have access to the quiz.',
  })
  @HttpCode(HttpStatus.OK)
  public async findAllQuestion(
    @RouteQuizIdParam() quizId: string,
  ): Promise<
    (
      | QuestionMultiChoice
      | QuestionRange
      | QuestionZeroToOneHundredRange
      | QuestionTrueFalse
      | QuestionTypeAnswer
      | QuestionPin
      | QuestionPuzzle
    )[]
  > {
    return this.quizService.findAllQuestion(quizId)
  }
}
