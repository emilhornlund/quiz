import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthorizedClientParam } from '../../client/controllers/decorators/auth'
import { Client } from '../../client/services/models/schemas'
import { QuizService } from '../services'

import { PaginatedQuizResponse, QuizPageQueryFilter } from './models'

/**
 * Controller for managing client-related operations.
 */
@ApiBearerAuth()
@ApiTags('client', 'quiz')
@Controller('client')
export class ClientQuizController {
  /**
   * Initializes the ClientQuizController.
   *
   * @param {QuizService} quizService - Service responsible for managing quiz-related operations.
   */
  constructor(private readonly quizService: QuizService) {}

  /**
   * Retrieves the quizzes associated with the authenticated client.
   *
   * @param {Client} client - The authenticated client making the request.
   *
   * @param {QuizPageQueryFilter} queryParams - The pagination and filtering query parameters for retrieving quizzes.
   *
   * @returns {Promise<PaginatedQuizResponse>} A paginated response containing the client's associated quizzes.
   */
  @Get('/quizzes')
  @ApiOperation({
    summary: 'Retrieve associated quizzes',
    description:
      'Fetches a paginated list of quizzes associated with the authenticated client.',
  })
  @ApiOkResponse({
    description: "Successfully retrieved the associated client's quizzes.",
    type: PaginatedQuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  public async getClientAssociatedQuizzes(
    @AuthorizedClientParam() client: Client,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: QuizPageQueryFilter,
  ): Promise<PaginatedQuizResponse> {
    return this.quizService.findQuizzesByOwnerId(
      client.player._id,
      queryParams.search,
      queryParams.mode,
      queryParams.visibility,
      queryParams.category,
      queryParams.languageCode,
      queryParams.sort,
      queryParams.order,
      queryParams.limit,
      queryParams.offset,
    )
  }
}
