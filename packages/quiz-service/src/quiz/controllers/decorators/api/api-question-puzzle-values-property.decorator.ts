import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  QUIZ_PUZZLE_VALUE_MAX_LENGTH,
  QUIZ_PUZZLE_VALUE_MIN_LENGTH,
  QUIZ_PUZZLE_VALUE_REGEX,
  QUIZ_PUZZLE_VALUES_MAX,
  QUIZ_PUZZLE_VALUES_MIN,
} from '@quiz/common'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * Decorator for documenting and validating the `values` property for Puzzle questions.
 *
 * Applies:
 * - `@ApiProperty` for Swagger documentation.
 * - `@IsArray`, `@ArrayMinSize`, `@ArrayMaxSize` to constrain list size.
 * - `@IsString`, `@MinLength`, `@MaxLength`, `@Matches` (each) to validate item content.
 */
export function ApiQuestionPuzzleValuesProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      title: 'Values',
      description:
        'List of values the player must sort. Client submits the final ordered list.',
      example: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
      required: true,
      type: [String],
    }),
    IsArray(),
    ArrayMinSize(QUIZ_PUZZLE_VALUES_MIN),
    ArrayMaxSize(QUIZ_PUZZLE_VALUES_MAX),
    IsString({ each: true }),
    MinLength(QUIZ_PUZZLE_VALUE_MIN_LENGTH, { each: true }),
    MaxLength(QUIZ_PUZZLE_VALUE_MAX_LENGTH, { each: true }),
    Matches(QUIZ_PUZZLE_VALUE_REGEX, {
      each: true,
      message:
        'Each value must contain only letters, numbers, punctuation, and spaces.',
    }),
    Type(() => String),
  )
}
