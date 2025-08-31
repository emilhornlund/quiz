import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import {
  GameMode,
  GameParticipantType,
  GameStatus,
  QuestionType,
} from '@quiz/common'
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose'

import {
  BaseQuestionDaoSchema,
  QuestionDao,
  QuestionMultiChoiceDaoSchema,
  QuestionPinDaoSchema,
  QuestionPuzzleDaoSchema,
  QuestionRangeDaoSchema,
  QuestionTrueFalseDaoSchema,
  QuestionTypeAnswerDaoSchema,
  Quiz,
} from '../../../../quiz/repositories/models/schemas'

import {
  Participant,
  ParticipantHostSchema,
  ParticipantPlayerSchema,
  ParticipantSchema,
} from './participant.schema'
import {
  BaseTask,
  BaseTaskSchema,
  LeaderboardTask,
  LeaderboardTaskSchema,
  LobbyTask,
  LobbyTaskSchema,
  PodiumTask,
  PodiumTaskSchema,
  QuestionResultTask,
  QuestionResultTaskSchema,
  QuestionTask,
  QuestionTaskSchema,
  QuitTask,
  QuitTaskSchema,
  TaskType,
} from './task.schema'

export type GameDocument = HydratedDocument<Game>

@Schema({ _id: true, collection: 'games' })
export class Game {
  @Prop({ type: String, required: true })
  _id: string

  @Prop({ type: String, required: true })
  name: string

  @Prop({ type: String, enum: GameMode, required: true })
  mode: GameMode

  @Prop({ type: String, enum: GameStatus, required: true })
  status: GameStatus

  @Prop({ type: String, required: true })
  pin: string

  /**
   * The quiz document associated with the game.
   */
  @Prop({ type: String, ref: 'Quiz' })
  quiz: Quiz

  /**
   * The associated questions of the game.
   */
  @Prop({ type: [BaseQuestionDaoSchema], required: true })
  questions: QuestionDao[]

  @Prop({ type: Number, required: true })
  nextQuestion: number

  @Prop({ type: [ParticipantSchema], required: true })
  participants: Participant[]

  @Prop({ type: BaseTaskSchema, required: true })
  currentTask: BaseTask &
    (
      | LobbyTask
      | QuestionTask
      | QuestionResultTask
      | LeaderboardTask
      | PodiumTask
      | QuitTask
    )

  @Prop({ type: [BaseTaskSchema], required: true })
  previousTasks: (BaseTask &
    (
      | LobbyTask
      | QuestionTask
      | QuestionResultTask
      | LeaderboardTask
      | PodiumTask
    ))[]

  @Prop({ type: Date, required: true })
  updated: Date

  @Prop({ type: Date, required: true })
  created: Date
}

/**
 * Mongoose model type for the Game schema.
 */
export type GameModel = Model<Game>

export const GameSchema = SchemaFactory.createForClass(Game)

const participantsSchema =
  GameSchema.path<MongooseSchema.Types.Array>('participants')
participantsSchema.discriminator(
  GameParticipantType.HOST,
  ParticipantHostSchema,
)
participantsSchema.discriminator(
  GameParticipantType.PLAYER,
  ParticipantPlayerSchema,
)

const questionsSchema = GameSchema.path<MongooseSchema.Types.Array>('questions')
questionsSchema.discriminator(
  QuestionType.MultiChoice,
  QuestionMultiChoiceDaoSchema,
)
questionsSchema.discriminator(QuestionType.Range, QuestionRangeDaoSchema)
questionsSchema.discriminator(
  QuestionType.TrueFalse,
  QuestionTrueFalseDaoSchema,
)
questionsSchema.discriminator(
  QuestionType.TypeAnswer,
  QuestionTypeAnswerDaoSchema,
)
questionsSchema.discriminator(QuestionType.Pin, QuestionPinDaoSchema)
questionsSchema.discriminator(QuestionType.Puzzle, QuestionPuzzleDaoSchema)

const currentTaskSchema =
  GameSchema.path<MongooseSchema.Types.Subdocument>('currentTask')
currentTaskSchema.discriminator(TaskType.Lobby, LobbyTaskSchema)
currentTaskSchema.discriminator(TaskType.Question, QuestionTaskSchema)
currentTaskSchema.discriminator(
  TaskType.QuestionResult,
  QuestionResultTaskSchema,
)
currentTaskSchema.discriminator(TaskType.Leaderboard, LeaderboardTaskSchema)
currentTaskSchema.discriminator(TaskType.Podium, PodiumTaskSchema)
currentTaskSchema.discriminator(TaskType.Quit, QuitTaskSchema)

const previousTasksSchema =
  GameSchema.path<MongooseSchema.Types.Array>('previousTasks')
previousTasksSchema.discriminator(TaskType.Lobby, LobbyTaskSchema)
previousTasksSchema.discriminator(TaskType.Question, QuestionTaskSchema)
previousTasksSchema.discriminator(
  TaskType.QuestionResult,
  QuestionResultTaskSchema,
)
previousTasksSchema.discriminator(TaskType.Leaderboard, LeaderboardTaskSchema)
previousTasksSchema.discriminator(TaskType.Podium, PodiumTaskSchema)
