import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

@Schema({ _id: false })
export class QuestionRange {
  type!: QuestionType.Slider

  @Prop({ type: Number, required: true })
  min: number

  @Prop({ type: Number, required: true })
  max: number

  @Prop({ type: Number, required: true })
  correct: number
}

export const QuestionRangeSchema = SchemaFactory.createForClass(QuestionRange)
