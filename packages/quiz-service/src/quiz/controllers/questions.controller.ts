import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'

import { ParseQuestionRequestPipe } from '../pipes'
import { QuestionService } from '../services'

import { ApiQuestionIdParam } from './decorators/api'
import { AuthorizedQuestion } from './decorators/auth'
import { RouteQuestionIdParam } from './decorators/route'
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
@Controller('questions/:questionId')
export class QuestionController {
  /**
   * Initializes the `QuestionController` with the required services.
   *
   * @param {QuestionService} questionsService - Service for handling question-related operations.
   */
  constructor(private readonly questionsService: QuestionService) {}

  /**
   * Retrieves the details of a specific question.
   *
   * This endpoint allows the client to fetch the details of a question
   * by its unique identifier. The response includes the question type
   * and its specific properties.
   *
   * @param {string} questionId - The unique identifier of the question to retrieve.
   *
   * @returns {Promise<QuestionResponse>} - The details of the requested question.
   */
  @Get()
  @AuthorizedQuestion()
  @ApiOperation({
    summary: 'Retrieve a quiz question',
    description: 'Fetches the details of a question by its unique identifier.',
  })
  @ApiQuestionIdParam()
  @ApiOkResponse({
    description: 'Successfully retrieved the question.',
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
    description: 'The client does not have access to the question.',
  })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  @HttpCode(HttpStatus.OK)
  public async findQuestion(
    @RouteQuestionIdParam() questionId: string,
  ): Promise<QuestionResponse> {
    return this.questionsService.findQuestion(questionId)
  }

  /**
   * Updates the details of an existing question.
   *
   * This endpoint allows the client to modify the properties of a question.
   * The request body must specify the question type and the updated values.
   *
   * @param {string} questionId - The unique identifier of the question to update.
   * @param {QuestionRequest} questionRequest - The updated question data.
   *
   * @returns {Promise<QuestionResponse>} - The updated question's details.
   */
  @Put()
  @AuthorizedQuestion()
  @ApiOperation({
    summary: 'Update a quiz question',
    description: 'Modifies the properties of an existing question.',
  })
  @ApiQuestionIdParam()
  @ApiBody({
    description: 'Request body for updating an existing question.',
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
    description: 'Successfully updated the question.',
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
    description: 'The client does not have access to the question.',
  })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  @HttpCode(HttpStatus.OK)
  public async updateQuestion(
    @RouteQuestionIdParam() questionId: string,
    @Body(new ParseQuestionRequestPipe()) questionRequest: QuestionRequest,
  ): Promise<QuestionResponse> {
    return this.questionsService.updateQuestion(questionId, questionRequest)
  }

  /**
   * Deletes a question from the database.
   *
   * This endpoint allows the client to remove a question by its unique identifier.
   * The operation is irreversible, and the question will be permanently deleted.
   *
   * @param {string} questionId - The unique identifier of the question to delete.
   *
   * @returns {Promise<void>} - Confirms successful deletion of the question.
   */
  @Delete()
  @AuthorizedQuestion()
  @ApiOperation({
    summary: 'Delete a question',
    description:
      'Removes a question from the database by its unique identifier.',
  })
  @ApiQuestionIdParam()
  @ApiOkResponse({
    description: 'Successfully deleted the question.',
    type: Object,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The client does not have access to the question.',
  })
  @ApiNotFoundResponse({ description: 'Question not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteQuestion(
    @RouteQuestionIdParam() questionId: string,
  ): Promise<void> {
    return this.questionsService.deleteQuestion(questionId)
  }
}
