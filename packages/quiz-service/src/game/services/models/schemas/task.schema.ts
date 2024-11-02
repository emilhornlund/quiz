import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { v4 as uuidv4 } from 'uuid'

export enum TaskType {
  Lobby = 'LOBBY',
}

/**
 * BaseTask
 */

@Schema({ _id: true, discriminatorKey: 'type' })
export class BaseTask {
  @Prop({ type: String, default: uuidv4 })
  _id: string

  @Prop({
    type: String,
    enum: Object.keys(TaskType),
    required: true,
  })
  type!: TaskType.Lobby

  @Prop({ type: Date, default: () => new Date() })
  created: Date
}

export const BaseTaskSchema = SchemaFactory.createForClass(BaseTask)

/**
 * TaskLobby
 */

@Schema({ _id: false })
export class TaskLobby {
  type!: TaskType.Lobby
}

export const TaskLobbySchema = SchemaFactory.createForClass(TaskLobby)
