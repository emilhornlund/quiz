import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

import {
  QuestionMultiChoiceOption,
  QuestionMultiChoiceOptionSchema,
} from './question-multi-choice-option.schema'

@Schema({ _id: false })
export class QuestionMultiChoice {
  type!: QuestionType.Multi

  @Prop({ type: [QuestionMultiChoiceOptionSchema], required: true })
  options: QuestionMultiChoiceOption[]
}

export const QuestionMultiChoiceSchema =
  SchemaFactory.createForClass(QuestionMultiChoice)
