import { readFileSync } from 'fs'

import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import * as jwt from 'jsonwebtoken'

import { EnvironmentVariables } from '../../app/config'
import { GameModule } from '../game'
import { MigrationModule } from '../migration'
import { UserModule } from '../user'

import { AuthController } from './controllers'
import { AuthGuard } from './guards'
import { AuthService, GoogleAuthService, TokenRepository } from './services'
import { Token, TokenSchema } from './services/models/schemas'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        const jwtSecret = configService.get<string>('JWT_SECRET')
        const jwtPrivateKeyPath = configService.get<string>(
          'JWT_PRIVATE_KEY_PATH',
        )
        const jwtPublicKeyPath = configService.get<string>(
          'JWT_PUBLIC_KEY_PATH',
        )

        const COMMON_JWT_OPTIONS: jwt.VerifyOptions & jwt.SignOptions = {
          algorithm: 'HS256',
          issuer: 'quiz',
          audience: `${configService.get<string>('ENVIRONMENT')}-quiz`,
        }

        return {
          global: true,
          secret: jwtSecret,
          privateKey: jwtPrivateKeyPath
            ? readFileSync(jwtPrivateKeyPath, 'utf8')
            : undefined,
          publicKey: jwtPublicKeyPath
            ? readFileSync(jwtPublicKeyPath, 'utf8')
            : undefined,
          signOptions: COMMON_JWT_OPTIONS,
          verifyOptions: COMMON_JWT_OPTIONS,
        }
      },
    }),
    MongooseModule.forFeature([
      {
        name: Token.name,
        schema: TokenSchema,
      },
    ]),
    EventEmitterModule,
    HttpModule,
    forwardRef(() => GameModule),
    forwardRef(() => MigrationModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    TokenRepository,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthenticationModule {}
