import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { RedisModule } from '@nestjs-modules/ioredis'
import Joi from 'joi'
import { MurLockModule } from 'murlock'

import { GameModule } from '../game'

import { EnvironmentVariables } from './config'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { ValidationPipe } from './pipes'

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
        JWT_SECRET: Joi.string(),
        JWT_PRIVATE_KEY_PATH: Joi.string(),
        JWT_PUBLIC_KEY_PATH: Joi.string(),
      }),
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
        options: { db: Number(config.get('REDIS_DB')) },
      }),
      inject: [ConfigService],
    }),
    MurLockModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        redisOptions: {
          url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
        },
        wait: 1000,
        maxAttempts: 3,
        logLevel: 'log',
        lockKeyPrefix: 'custom',
        ignoreUnlockFail: false,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<EnvironmentVariables>) => {
        return {
          uri: `mongodb://${config.get('MONGODB_HOST')}:${config.get('MONGODB_PORT')}/${config.get('MONGODB_DB')}`,
        }
      },
      inject: [ConfigService],
    }),
    GameModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
