import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { BullModule } from '@nestjs/bullmq'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { RedisModule } from '@nestjs-modules/ioredis'
import Joi from 'joi'
import { MurLockModule } from 'murlock'

import { AuthModule } from '../auth'
import { ClientModule } from '../client'
import { GameModule } from '../game'
import { HealthModule } from '../health'
import { MediaModule } from '../media'
import { PlayerModule } from '../player'
import { QuizModule } from '../quiz'

import { EnvironmentVariables } from './config'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { ValidationPipe } from './pipes'

const isTestEnv = process.env.NODE_ENV === 'test'

/**
 * Root application module.
 *
 * This module initializes all core modules and shared configurations, including
 * database connections, exception filters, and core modules such as GameModule, AuthModule,
 * ClientModule, and PlayerModule.
 */
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
        PEXELS_API_KEY: Joi.string(),
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
          database: Number(config.get('REDIS_DB')),
        },
        wait: 1000,
        maxAttempts: 3,
        logLevel: 'log',
        lockKeyPrefix: 'custom',
        ignoreUnlockFail: false,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          db: Number(config.get('REDIS_DB')),
        },
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
    ...(isTestEnv
      ? []
      : [
          ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService<EnvironmentVariables>) => ({
              throttlers: [
                {
                  name: 'short',
                  ttl: 1000,
                  limit: 10,
                },
                {
                  name: 'medium',
                  ttl: 10000,
                  limit: 20,
                },
                {
                  name: 'long',
                  ttl: 60000,
                  limit: 100,
                },
              ],
              storage: new ThrottlerStorageRedisService(
                `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
              ),
            }),
          }),
        ]),
    AuthModule,
    ClientModule,
    GameModule,
    HealthModule,
    MediaModule,
    PlayerModule,
    QuizModule,
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
    ...(isTestEnv
      ? []
      : [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ]),
  ],
})
export class AppModule {}
