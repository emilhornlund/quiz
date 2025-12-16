import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UserModule } from '../user'

import { GameResultController } from './controllers'
import { GameResultRepository } from './repositories'
import { GameResult, GameResultSchema } from './repositories/models/schemas'
import { GameResultService } from './services'

/**
 * GameResultModule sets up the controllers, providers, and Mongoose schemas
 * required for retrieving and persisting game results.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameResult.name,
        schema: GameResultSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [GameResultController],
  providers: [Logger, GameResultRepository, GameResultService],
  exports: [GameResultService],
})
export class GameResultModule {}
