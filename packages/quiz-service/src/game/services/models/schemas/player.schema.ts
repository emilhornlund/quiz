import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { v4 as uuidv4 } from 'uuid'

@Schema({ _id: true })
export class Player {
  @Prop({ type: String, default: uuidv4 })
  _id: string

  @Prop({ type: String, required: true })
  nickname: string

  @Prop({ type: Date, default: () => new Date() })
  joined: Date
}

export const PlayerSchema = SchemaFactory.createForClass(Player)
