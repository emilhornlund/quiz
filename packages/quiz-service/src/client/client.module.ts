import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ClientService } from './services'
import { Client, ClientSchema } from './services/models/schemas'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Client.name,
        schema: ClientSchema,
      },
    ]),
  ],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
