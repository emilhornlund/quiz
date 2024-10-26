import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

@Schema({ _id: false })
export class QuestionTypeAnswer {
  type!: QuestionType.TypeAnswer

  @Prop({ type: String, required: true })
  correct: string
}

export const QuestionTypeAnswerSchema =
  SchemaFactory.createForClass(QuestionTypeAnswer)
