import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

@Schema({ _id: false })
export class QuestionTrueFalse {
  type!: QuestionType.TrueFalse

  @Prop({ type: Boolean, required: true })
  correct: boolean
}

export const QuestionTrueFalseSchema =
  SchemaFactory.createForClass(QuestionTrueFalse)
