import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { QuestionType } from '@quiz/common'
import { IsEnum } from 'class-validator'

export function ApiGameQuestionTypeProperty(type: QuestionType) {
  return applyDecorators(
    ApiProperty({
      description: `The type of the question, which is set to {type} for this request.`,
      enum: [type],
      example: type,
      required: true,
      type: String,
    }),
    IsEnum(QuestionType),
  )
}
