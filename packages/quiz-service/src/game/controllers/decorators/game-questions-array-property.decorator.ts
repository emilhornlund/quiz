import { applyDecorators } from '@nestjs/common'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'

export function GameQuestionsArrayProperty(options?: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  oneOf?: (string | Function)[]
}) {
  return applyDecorators(
    ApiProperty({
      description:
        'The list of questions to be included in the game. Must include at least one question.',
      required: true,
      minimum: 1,
      oneOf:
        options?.oneOf?.map((model) => ({ $ref: getSchemaPath(model) })) ?? [],
    }),
    IsArray(),
    ArrayMinSize(1),
    ValidateNested({ each: true }),
    Type(() => Object),
  )
}
