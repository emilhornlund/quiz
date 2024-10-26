import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { QuestionType } from '@quiz/common'

@Schema({ _id: false, discriminatorKey: 'type' })
export class BaseQuestion {
  @Prop({
    enum: [QuestionType.Multi, QuestionType.Slider],
    required: true,
  })
  type!: QuestionType.Multi | QuestionType.Slider

  @Prop({ type: String, required: true })
  question: string

  @Prop({ type: String, required: false })
  imageURL?: string

  @Prop({ type: Number, required: true })
  points: number

  @Prop({ type: Number, required: true })
  duration: number
}

export const BaseQuestionSchema = SchemaFactory.createForClass(BaseQuestion)
