import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('local', 'development', 'production', 'test')
          .default('local'),
        SERVER_PORT: Joi.number().port().default(8080),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
