import { ApiPropertyOptional } from '@nestjs/swagger'
import { GameMode, QuizVisibility } from '@quiz/common'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

/**
 * Represents query parameters for paginated quiz retrieval.
 */
export class ApiQuizPageQueryFilter {
  /**
   * A search term to filter quizzes by their titles.
   */
  @ApiPropertyOptional({
    name: 'search',
    description: 'A search term to filter quizzes by their titles.',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string

  /**
   * Filters quizzes by game mode.
   */
  @ApiPropertyOptional({
    name: 'mode',
    description: 'Filters quizzes by game mode.',
    enum: GameMode,
    required: false,
    default: undefined,
    example: `${GameMode.Classic}`,
  })
  @IsOptional()
  @IsEnum(GameMode)
  mode?: GameMode

  /**
   * Filters quizzes by visibility.
   */
  @ApiPropertyOptional({
    name: 'mode',
    description: 'Filters quizzes by their visibility.',
    enum: QuizVisibility,
    required: false,
    default: undefined,
    example: `${QuizVisibility.Public}`,
  })
  @IsOptional()
  @IsEnum(QuizVisibility)
  visibility?: QuizVisibility

  /**
   * The field by which to sort the results.
   */
  @ApiPropertyOptional({
    name: 'sort',
    description: 'The field by which to sort the results.',
    enum: ['title', 'created', 'updated'],
    required: false,
    default: 'title',
    example: 'title',
  })
  @IsOptional()
  @IsEnum(['title', 'created', 'updated'], {
    message:
      'sort must be one of the following values: title, created, updated',
  })
  sort?: 'title' | 'created' | 'updated'

  /**
   * The sort order for the results.
   */
  @ApiPropertyOptional({
    name: 'order',
    description: 'The sort order for the results.',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'order must be one of the following values: asc, desc',
  })
  order?: 'asc' | 'desc'

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
  @Type(() => Number)
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
  @Type(() => Number)
  offset?: number
}
