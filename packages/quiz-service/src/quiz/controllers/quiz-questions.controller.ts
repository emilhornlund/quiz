import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'

import { ParseQuestionRequestPipe } from '../pipes'
import { QuestionService } from '../services'

import { ApiQuizIdParam } from './decorators/api'
import { AuthorizedQuiz } from './decorators/auth'
import { RouteQuizIdParam } from './decorators/route'
import {
  QuestionMultiChoiceRequest,
  QuestionMultiChoiceResponse,
  QuestionRangeRequest,
  QuestionRangeResponse,
  QuestionRequest,
  QuestionResponse,
  QuestionTrueFalseRequest,
  QuestionTrueFalseResponse,
  QuestionTypeAnswerRequest,
  QuestionTypeAnswerResponse,
} from './models'
import {
  QuestionRequestExamples,
  QuestionResponseMultiChoiceExample,
} from './utils/question-examples.utils'

/**
 * Controller for managing question-related operations.
 */
@ApiBearerAuth()
@ApiExtraModels(
  QuestionMultiChoiceRequest,
  QuestionRangeRequest,
  QuestionTrueFalseRequest,
  QuestionTypeAnswerRequest,
  QuestionMultiChoiceResponse,
  QuestionRangeResponse,
  QuestionTrueFalseResponse,
  QuestionTypeAnswerResponse,
)
@ApiTags('question')
@Controller('quizzes/:quizId/questions')
export class QuizQuestionsController {
  /**
   * Initializes the `QuizQuestionsController` with the necessary services.
   *
   * @param {QuestionService} questionsService - Service for handling question-related operations.
   */
  constructor(private readonly questionsService: QuestionService) {}

  /**
   * Creates a new question for a specific quiz.
   *
   * This endpoint allows the client to add a new question to a quiz. The
   * question type and properties are determined by the request body.
   *
   * @param {string} quizId - The unique identifier of the quiz to which the question belongs.
   * @param {QuestionRequest} questionRequest - The request body containing the details of the question to create.
   *
   * @returns {Promise<QuestionResponse>} - The newly created question.
   */
  @Post()
  @AuthorizedQuiz()
  @ApiOperation({
    summary: 'Create a new quiz question',
    description: 'Adds a new question to the specified quiz.',
  })
  @ApiQuizIdParam()
  @ApiBody({
    description: 'Request body for creating a new question.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(QuestionMultiChoiceRequest) },
        { $ref: getSchemaPath(QuestionRangeRequest) },
        { $ref: getSchemaPath(QuestionTrueFalseRequest) },
        { $ref: getSchemaPath(QuestionTypeAnswerRequest) },
      ],
    },
    examples: QuestionRequestExamples,
  })
  @ApiOkResponse({
    description: 'Successfully created the question.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(QuestionMultiChoiceResponse) },
        { $ref: getSchemaPath(QuestionRangeResponse) },
        { $ref: getSchemaPath(QuestionTrueFalseResponse) },
        { $ref: getSchemaPath(QuestionTypeAnswerResponse) },
      ],
    },
    example: QuestionResponseMultiChoiceExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The client does not have access to this quiz.',
  })
  @HttpCode(HttpStatus.CREATED)
  public async createQuestion(
    @RouteQuizIdParam() quizId: string,
    @Body(new ParseQuestionRequestPipe()) questionRequest: QuestionRequest,
  ): Promise<QuestionResponse> {
    return this.questionsService.createQuestion(quizId, questionRequest)
  }

  /**
   * Retrieves all questions for a specific quiz.
   *
   * This endpoint fetches all the questions associated with the specified quiz.
   * The response includes details for each question, including its type and specific properties.
   *
   * @param {string} quizId - The unique identifier of the quiz for which to retrieve questions.
   *
   * @returns {Promise<QuestionResponse[]>} - An array of questions associated with the specified quiz.
   */
  @Get()
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
          { $ref: getSchemaPath(QuestionMultiChoiceResponse) },
          { $ref: getSchemaPath(QuestionRangeResponse) },
          { $ref: getSchemaPath(QuestionTrueFalseResponse) },
          { $ref: getSchemaPath(QuestionTypeAnswerResponse) },
        ],
      },
    },
    example: [QuestionResponseMultiChoiceExample],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The client does not have access to the quiz.',
  })
  @HttpCode(HttpStatus.OK)
  public async findAllQuestion(
    @RouteQuizIdParam() quizId: string,
  ): Promise<QuestionResponse[]> {
    return this.questionsService.findAllQuestion(quizId)
  }
}
