import { Authority, TokenScope } from '@klurigo/common'
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  RequiredAuthorities,
  RequiresScopes,
} from '../../authentication/controllers/decorators'
import { AuthorizedQuiz } from '../../quiz-core/decorators/auth'
import {
  ApiQuizIdParam,
  RouteQuizIdParam,
} from '../../quiz-core/decorators/params'
import { QuizRatingService } from '../services'

import {
  PaginatedQuizRatingFilter,
  PaginatedQuizRatingResponse,
} from './models'

/**
 * Controller for retrieving quiz ratings for a given quiz.
 *
 * Supports pagination, sorting, and filtering to only include ratings with comments.
 */
@ApiBearerAuth()
@ApiTags('quiz')
@RequiresScopes(TokenScope.User)
@RequiredAuthorities(Authority.Quiz)
@Controller('/quizzes/:quizId')
export class QuizRatingController {
  /**
   * Creates an instance of QuizRatingController.
   *
   * @param quizRatingService - Service for creating and retrieving quiz ratings.
   */
  constructor(private readonly quizRatingService: QuizRatingService) {}

  /**
   * Retrieves quiz ratings for the specified quiz with pagination and sorting.
   *
   * @param quizId - The unique identifier of the quiz.
   * @param queryParams - Pagination, sorting, and filtering parameters.
   *
   * @returns A paginated list of quiz ratings.
   */
  @Get('/ratings')
  @AuthorizedQuiz({ allowPublic: true })
  @ApiOperation({
    summary: 'Retrieves quiz ratings for a quiz.',
    description:
      'Returns a paginated list of ratings for the specified quiz, with optional sorting and filtering to only include ratings that have comments.',
  })
  @ApiQuizIdParam()
  @ApiOkResponse({
    description: 'A paginated list of quiz ratings.',
    type: PaginatedQuizRatingResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions to access quiz ratings.',
  })
  @HttpCode(HttpStatus.OK)
  public async getAllQuizRatings(
    @RouteQuizIdParam() quizId: string,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: PaginatedQuizRatingFilter,
  ): Promise<PaginatedQuizRatingResponse> {
    return this.quizRatingService.findQuizRatingsWithPagination(quizId, {
      offset: queryParams.offset,
      limit: queryParams.limit,
      sort: {
        field: queryParams.sort,
        order: queryParams.order,
      },
      commentsOnly: queryParams.commentsOnly,
    })
  }
}
