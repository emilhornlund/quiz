import { Logger, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'

import { PlayerModule } from '../player'
import { QuizModule } from '../quiz'

import { ClientController } from './controllers'
import { ClientListener } from './handlers'
import { ClientService } from './services'
import { Client, ClientSchema } from './services/models/schemas'

/**
 * Module for managing client-related operations.
 *
 * This module imports the PlayerModule to handle the association between clients and players.
 * It also provides the ClientService and defines the schema for the Client collection.
 */
@Module({
  imports: [
    EventEmitterModule,
    MongooseModule.forFeature([
      {
        name: Client.name,
        schema: ClientSchema,
      },
    ]),
    PlayerModule,
    QuizModule,
  ],
  controllers: [ClientController],
  providers: [Logger, ClientService, ClientListener],
  exports: [ClientService],
})
export class ClientModule {}
