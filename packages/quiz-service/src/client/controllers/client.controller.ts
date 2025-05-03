import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { PaginatedQuizResponse } from '../../quiz/controllers/models'
import { QuizService } from '../../quiz/services'
import { Client } from '../services/models/schemas'

import { ApiQuizPageQueryFilter } from './decorators/api'
import { AuthorizedClientParam } from './decorators/auth'

/**
 * Controller for managing client-related operations.
 */
@ApiBearerAuth()
@ApiTags('client')
@Controller('client')
export class ClientController {
  /**
   * Initializes the ClientController.
   *
   * @param {QuizService} quizService - Service responsible for managing quiz-related operations.
   */
  constructor(private readonly quizService: QuizService) {}

  /**
   * Retrieves the quizzes associated with the authenticated client.
   *
   * @param {Client} client - The authenticated client making the request.
   *
   * @param {ApiQuizPageQueryFilter} queryParams - The pagination and filtering query parameters for retrieving quizzes.
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
    queryParams: ApiQuizPageQueryFilter,
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
