import { BadRequestException } from '@nestjs/common'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import {
  GameMode,
  LanguageCode,
  QuestionType,
  QuizClassicModeRequestDto,
  QuizVisibility,
  QuizZeroToOneHundredModeRequestDto,
} from '@quiz/common'
import { plainToInstance, Transform } from 'class-transformer'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'

import {
  ApiModeProperty,
  ApiQuizDescriptionProperty,
  ApiQuizImageCoverProperty,
  ApiQuizLanguageCodeProperty,
  ApiQuizTitleProperty,
  ApiQuizVisibilityProperty,
} from '../decorators/api'

import {
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  QuestionZeroToOneHundredRange,
} from './question'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQuestionClassicBasedOnType(question: any) {
  switch (question?.type) {
    case QuestionType.MultiChoice:
      return plainToInstance(QuestionMultiChoice, question)
    case QuestionType.Range:
      return plainToInstance(QuestionRange, question)
    case QuestionType.TrueFalse:
      return plainToInstance(QuestionTrueFalse, question)
    case QuestionType.TypeAnswer:
      return plainToInstance(QuestionTypeAnswer, question)
    default:
      throw new BadRequestException('Validation failed')
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformQuestionZeroToOneHundredBasedOnType(question: any) {
  switch (question?.type) {
    case QuestionType.Range:
      return plainToInstance(QuestionZeroToOneHundredRange, question)
    default:
      throw new BadRequestException('Validation failed')
  }
}

/**
 * Represents the request object for creating and updating a quiz.
 */
@ApiExtraModels(
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  QuestionZeroToOneHundredRange,
)
export class QuizClassicRequest implements QuizClassicModeRequestDto {
  /**
   * The title of the quiz.
   */
  @ApiQuizTitleProperty()
  title: string

  /**
   * A description of the quiz.
   */
  @ApiQuizDescriptionProperty()
  description?: string

  /**
   * Whether the quiz is public or private.
   */
  @ApiQuizVisibilityProperty()
  visibility: QuizVisibility

  /**
   * The URL of the cover image for the quiz.
   */
  @ApiQuizImageCoverProperty()
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  @ApiQuizLanguageCodeProperty()
  languageCode: LanguageCode

  /**
   * The game mode of the quiz.
   */
  @ApiModeProperty(GameMode.Classic)
  mode: GameMode.Classic

  /**
   *
   */
  @ApiProperty({
    description:
      'The list of questions to be included in the quiz. Must include at least one question.',
    required: true,
    minimum: 1,
    oneOf: [
      { $ref: getSchemaPath(QuestionMultiChoice) },
      { $ref: getSchemaPath(QuestionRange) },
      { $ref: getSchemaPath(QuestionTrueFalse) },
      { $ref: getSchemaPath(QuestionTypeAnswer) },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Transform(({ value }) => value.map(transformQuestionClassicBasedOnType), {
    toClassOnly: true,
  })
  questions: (
    | QuestionMultiChoice
    | QuestionRange
    | QuestionTrueFalse
    | QuestionTypeAnswer
  )[]
}

/**
 * Represents the request object for creating and updating a zero to one hundred quiz.
 */
@ApiExtraModels(QuestionZeroToOneHundredRange)
export class QuizZeroToOneHundredRequest
  implements QuizZeroToOneHundredModeRequestDto
{
  /**
   * The title of the quiz.
   */
  @ApiQuizTitleProperty()
  title: string

  /**
   * A description of the quiz.
   */
  @ApiQuizDescriptionProperty()
  description?: string

  /**
   * Whether the quiz is public or private.
   */
  @ApiQuizVisibilityProperty()
  visibility: QuizVisibility

  /**
   * The URL of the cover image for the quiz.
   */
  @ApiQuizImageCoverProperty()
  imageCoverURL?: string

  /**
   * The language code of the quiz.
   */
  @ApiQuizLanguageCodeProperty()
  languageCode: LanguageCode

  /**
   *
   */
  @ApiModeProperty(GameMode.ZeroToOneHundred)
  mode: GameMode.ZeroToOneHundred

  /**
   *
   */
  @ApiProperty({
    description:
      'The list of questions to be included in the quiz. Must include at least one question.',
    required: true,
    minimum: 1,
    oneOf: [{ $ref: getSchemaPath(QuestionZeroToOneHundredRange) }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Transform(
    ({ value }) => value.map(transformQuestionZeroToOneHundredBasedOnType),
    {
      toClassOnly: true,
    },
  )
  questions: QuestionZeroToOneHundredRange[]
}
