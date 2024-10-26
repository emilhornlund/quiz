import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ _id: false })
export class QuestionMultiChoiceOption {
  @Prop({ type: String, required: true })
  value: string

  @Prop({ type: Boolean, required: true })
  correct: boolean
}

export const QuestionMultiChoiceOptionSchema = SchemaFactory.createForClass(
  QuestionMultiChoiceOption,
)
