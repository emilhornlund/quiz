import KeyvRedis from '@keyv/redis'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { RedisModule } from '@nestjs-modules/ioredis'
import Joi from 'joi'
import Keyv from 'keyv'
import { MurLockModule } from 'murlock'

import { AuthModule } from '../auth'
import { GameModule } from '../game'
import { HealthModule } from '../health'
import { MediaModule } from '../media'
import { QuizModule } from '../quiz'
import { UserModule } from '../user'

import { EnvironmentVariables } from './config'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { ValidationPipe } from './pipes'

const isTestEnv = process.env.NODE_ENV === 'test'

/**
 * Root application module.
 *
 * This module initializes all core modules and shared configurations, including
 * database connections, exception filters, and core modules such as GameModule and AuthModule.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        ENVIRONMENT: Joi.string()
          .valid('local', 'beta', 'prod', 'test')
          .required(),
        SERVER_PORT: Joi.number().port().default(8080),
        SERVER_ALLOW_ORIGIN: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().port().required(),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_DB: Joi.number().default(0),
        MONGODB_HOST: Joi.string().required(),
        MONGODB_PORT: Joi.number().port().required(),
        MONGODB_USERNAME: Joi.string().optional(),
        MONGODB_PASSWORD: Joi.string().optional(),
        MONGODB_DB: Joi.string().required(),
        JWT_SECRET: Joi.string(),
        JWT_PRIVATE_KEY_PATH: Joi.string(),
        JWT_PUBLIC_KEY_PATH: Joi.string(),
        PEXELS_API_KEY: Joi.string().required(),
        UPLOAD_DIRECTORY: Joi.string().required(),
        EMAIL_ENABLED: Joi.boolean().default(true),
        EMAIL_USERNAME: Joi.string().optional(),
        EMAIL_PASSWORD: Joi.string().optional(),
        KLURIGO_URL: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
        options: {
          password: config.get('REDIS_PASSWORD'),
          db: Number(config.get('REDIS_DB')),
        },
      }),
      inject: [ConfigService],
    }),
    MurLockModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        redisOptions: {
          url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
          password: config.get('REDIS_PASSWORD'),
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
          password: config.get('REDIS_PASSWORD'),
          db: Number(config.get('REDIS_DB')),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<EnvironmentVariables>) => {
        const username = config.get('MONGODB_USERNAME')
        const password = config.get('MONGODB_PASSWORD')
        if (username && password) {
          return {
            uri: `mongodb://${username}:${password}@${config.get('MONGODB_HOST')}:${config.get('MONGODB_PORT')}/${config.get('MONGODB_DB')}`,
          }
        }
        return {
          uri: `mongodb://${config.get('MONGODB_HOST')}:${config.get('MONGODB_PORT')}/${config.get('MONGODB_DB')}`,
        }
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        stores: [
          new Keyv(
            new KeyvRedis({
              url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
              password: config.get('REDIS_PASSWORD'),
              database: Number(config.get('REDIS_DB')),
            }),
          ),
        ],
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
              storage: new ThrottlerStorageRedisService({
                host: config.get('REDIS_HOST'),
                port: config.get('REDIS_PORT'),
                password: config.get('REDIS_PASSWORD'),
                db: Number(config.get('REDIS_DB')),
              }),
            }),
          }),
        ]),
    AuthModule,
    GameModule,
    HealthModule,
    MediaModule,
    QuizModule,
    UserModule,
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
