import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { RedisModule } from '@nestjs-modules/ioredis'
import Joi from 'joi'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        SERVER_PORT: Joi.number().port().default(8080),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().port().required(),
        REDIS_DB: Joi.number().default(0),
        MONGODB_HOST: Joi.string().required(),
        MONGODB_PORT: Joi.number().port().required(),
        MONGODB_DB: Joi.string().default('quiz_service'),
      }),
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
        options: { db: Number(config.get('REDIS_DB')) },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        if (process.env.NODE_ENV === 'test') {
          const mongod = await MongoMemoryServer.create({
            binary: {
              downloadDir: 'node_modules/.cache/mongodb-memory-server',
            },
          })
          console.log(mongod.getUri())

          return { uri: mongod.getUri() }
        }
        return {
          uri: `mongodb://${config.get('MONGODB_HOST')}:${config.get('MONGODB_PORT')}/${config.get('MONGODB_DB')}`,
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
