import {
  CreateClassicModeGameRequestDto,
  CreateClassicModeQuestionMultiRequestDto,
  CreateClassicModeQuestionSliderRequestDto,
  CreateClassicModeQuestionTrueFalseRequestDto,
  CreateClassicModeQuestionTypeAnswerRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  CreateZeroToOneHundredModeQuestionSliderRequestDto,
  QuestionType,
} from '@quiz/common'
import {
  CreateClassicModeQuestionMultiAnswerRequestDto,
  GameMode,
} from '@quiz/common'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator'

import {
  AtLeastOneCorrectAnswerValidator,
  InRangeValidator,
  MinMaxValidator,
} from '../decorators'

export class CreateClassicModeQuestionMultiAnswerRequest
  implements CreateClassicModeQuestionMultiAnswerRequestDto
{
  @IsString()
  @MinLength(1)
  @MaxLength(75)
  value: string

  @IsBoolean()
  correct: boolean
}

export class CreateClassicModeQuestionMultiRequest
  implements CreateClassicModeQuestionMultiRequestDto
{
  @IsEnum(QuestionType)
  type: QuestionType.Multi

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  question: string

  @IsUrl()
  @IsOptional()
  imageURL?: string

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Validate(AtLeastOneCorrectAnswerValidator)
  answers: CreateClassicModeQuestionMultiAnswerRequest[]

  @IsNumber()
  @IsIn([0, 1000, 2000])
  points: number

  @IsNumber()
  @IsIn([5, 30, 60, 120])
  duration: number
}

export class CreateClassicModeQuestionTrueFalseRequest
  implements CreateClassicModeQuestionTrueFalseRequestDto
{
  @IsEnum(QuestionType)
  type: QuestionType.TrueFalse

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  question: string

  @IsUrl()
  @IsOptional()
  imageURL?: string

  @IsBoolean()
  correct: boolean

  @IsNumber()
  @IsIn([0, 1000, 2000])
  points: number

  @IsNumber()
  @IsIn([5, 30, 60, 120])
  duration: number
}

export class CreateClassicModeQuestionSliderRequest
  implements CreateClassicModeQuestionSliderRequestDto
{
  @IsEnum(QuestionType)
  type: QuestionType.Slider

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  question: string

  @IsUrl()
  @IsOptional()
  imageURL?: string

  @IsNumber()
  @Min(-10000)
  @Max(10000)
  @Validate(MinMaxValidator, ['min', 'max'])
  min: number

  @IsNumber()
  @Min(-10000)
  @Max(10000)
  @Validate(MinMaxValidator, ['min', 'max'])
  max: number

  @IsNumber()
  @Min(-10000)
  @Max(10000)
  @Validate(InRangeValidator, ['correct', 'min', 'max'])
  correct: number

  @IsNumber()
  @IsIn([0, 1000, 2000])
  points: number

  @IsNumber()
  @IsIn([5, 30, 60, 120])
  duration: number
}

export class CreateZeroToOneHundredModeQuestionSliderRequest
  implements CreateZeroToOneHundredModeQuestionSliderRequestDto
{
  @IsEnum(QuestionType)
  type: QuestionType.Slider

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  question: string

  @IsUrl()
  @IsOptional()
  imageURL?: string

  @IsNumber()
  @Min(0)
  @Max(100)
  correct: number

  @IsNumber()
  @IsIn([0, 1000, 2000])
  points: number

  @IsNumber()
  @IsIn([5, 30, 60, 120])
  duration: number
}

export class CreateClassicModeQuestionTypeAnswerRequest
  implements CreateClassicModeQuestionTypeAnswerRequestDto
{
  @IsEnum(QuestionType)
  type: QuestionType.TypeAnswer

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  question: string

  @IsUrl()
  @IsOptional()
  imageURL?: string

  @IsString()
  @MinLength(1)
  @MaxLength(75)
  correct: string

  @IsNumber()
  @IsIn([0, 1000, 2000])
  points: number

  @IsNumber()
  @IsIn([5, 30, 60, 120])
  duration: number
}

export class CreateClassicModeGameRequest
  implements CreateClassicModeGameRequestDto
{
  @IsString()
  @MinLength(3)
  @MaxLength(25)
  name: string

  @IsEnum(GameMode)
  mode: GameMode.Classic

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Object)
  questions: (
    | CreateClassicModeQuestionMultiRequest
    | CreateClassicModeQuestionTrueFalseRequest
    | CreateClassicModeQuestionSliderRequest
    | CreateClassicModeQuestionTypeAnswerRequest
  )[]
}

export class CreateZeroToOneHundredModeGameRequest
  implements CreateZeroToOneHundredModeGameRequestDto
{
  @IsString()
  @MinLength(3)
  @MaxLength(25)
  name: string

  @IsEnum(GameMode)
  mode: GameMode.ZeroToOneHundred

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Object)
  questions: CreateZeroToOneHundredModeQuestionSliderRequest[]
}
