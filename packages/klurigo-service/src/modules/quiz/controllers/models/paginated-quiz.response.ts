import { PaginatedQuizResponseDto } from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber, Max, Min } from 'class-validator'

import { QuizResponse } from './quiz.response'

/**
 * Represents a paginated response for quizzes, including metadata such as total, limit, and offset.
 */
export class PaginatedQuizResponse implements PaginatedQuizResponseDto {
  /**
   * The list of quiz results for the current page.
   */
  @ApiProperty({
    description: 'The list of quiz results for the current page.',
    type: [QuizResponse],
    required: true,
  })
  @IsArray()
  results: QuizResponse[]

  /**
   * The total number of quizzes available.
   */
  @ApiProperty({
    description: 'The total number of quizzes available.',
    type: Number,
    minimum: 0,
    required: true,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  total: number

  /**
   * The maximum number of quizzes returned per page.
   */
  @ApiProperty({
    description: 'The maximum number of quizzes returned per page.',
    type: Number,
    required: true,
    minimum: 0,
    maximum: 50,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  limit: number

  /**
   * The offset from the start of the total quizzes.
   */
  @ApiProperty({
    description: 'The offset from the start of the total quizzes.',
    type: Number,
    minimum: 0,
    required: true,
    example: 0,
  })
  @IsNumber()
  @Min(0)
  offset: number
}
