import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Authority, TokenScope } from '@quiz/common'

import {
  Principal,
  RequiredAuthorities,
  RequiresScopes,
} from '../../auth/controllers/decorators'
import { User } from '../../user/services/models/schemas'
import { QuizService } from '../services'

import { PaginatedQuizResponse, QuizPageQueryFilter } from './models'

/**
 * Controller for managing profile quiz-related operations.
 */
@ApiBearerAuth()
@ApiTags('profile', 'quiz')
@RequiresScopes(TokenScope.User)
@RequiredAuthorities(Authority.Quiz)
@Controller('profile')
export class ProfileQuizController {
  /**
   * Initializes the ProfileQuizController.
   *
   * @param quizService - Service responsible for managing quiz-related operations.
   */
  constructor(private readonly quizService: QuizService) {}

  /**
   * Retrieves the quizzes associated with the authenticated user.
   *
   * @param user - The authenticated user making the request.
   *
   * @param queryParams - The pagination and filtering query parameters for retrieving quizzes.
   *
   * @returns A paginated response containing the user's associated quizzes.
   */
  @Get('/quizzes')
  @ApiOperation({
    summary: 'Retrieve associated quizzes',
    description:
      'Fetches a paginated list of quizzes associated with the authenticated user.',
  })
  @ApiOkResponse({
    description: "Successfully retrieved the associated user's quizzes.",
    type: PaginatedQuizResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the endpoint.',
  })
  public async getUserAssociatedQuizzes(
    @Principal() user: User,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: QuizPageQueryFilter,
  ): Promise<PaginatedQuizResponse> {
    return this.quizService.findQuizzesByOwnerId(
      user._id,
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
