import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

/**
 * Represents query parameters for paginated quiz retrieval.
 */
export class ApiQuizPageQuery {
  /**
   * The maximum number of quizzes to retrieve per page.
   */
  @ApiPropertyOptional({
    description: 'The maximum number of quizzes to retrieve per page.',
    type: Number,
    minimum: 5,
    maximum: 50,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  limit?: number

  /**
   * The number of quizzes to skip before starting retrieval.
   */
  @ApiPropertyOptional({
    description: 'The number of quizzes to skip before starting retrieval.',
    type: Number,
    minimum: 0,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number
}
