import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthorizedClientParam } from '../../client/controllers/decorators/auth'
import { Client } from '../../client/services/models/schemas'
import { QuizService } from '../services'

import { ApiQuizIdParam } from './decorators/api'
import { AuthorizedQuiz } from './decorators/auth'
import { RouteQuizIdParam } from './decorators/route'
import { QuizRequest, QuizResponse } from './models'

/**
 * Controller for managing quiz-related operations.
 */
@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizController {
  /**
   * Initializes the QuizController.
   *
   * @param {QuizService} quizService - Service for managing quiz operations.
   */
  constructor(private readonly quizService: QuizService) {}

  /**
   * Creates a new quiz and associates it with the authenticated client.
   *
   * @param {Client} client - The client initiating the request.
   * @param {QuizRequest} quizRequest - The details of the quiz to create.
   *
   * @returns {Promise<QuizResponse>} The newly created quiz.
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new quiz',
    description:
      'Creates a new quiz and associates it with the authenticated client.',
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
    @AuthorizedClientParam() client: Client,
    @Body() quizRequest: QuizRequest,
  ): Promise<QuizResponse> {
    return this.quizService.createQuiz(quizRequest, client.player)
  }

  /**
   * Retrieves a quiz by its unique ID.
   *
   * @param {string} quizId - The ID of the quiz to retrieve.
   *
   * @returns {Promise<QuizResponse>} The requested quiz.
   */
  @Get(':quizId')
  @AuthorizedQuiz()
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
    description: 'The client does not have access to this quiz.',
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
   * @param {QuizRequest} quizRequest - The new details for the quiz.
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
  @ApiOkResponse({
    description: 'Successfully updated the quiz.',
    type: QuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  @ApiForbiddenResponse({
    description: 'The client does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @HttpCode(HttpStatus.OK)
  public async updateQuiz(
    @RouteQuizIdParam() quizId: string,
    @Body() quizRequest: QuizRequest,
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
    description: 'The client does not have access to this quiz.',
  })
  @ApiNotFoundResponse({ description: 'Quiz not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteQuiz(@RouteQuizIdParam() quizId: string): Promise<void> {
    return this.quizService.deleteQuiz(quizId)
  }
}
