import { readFileSync } from 'fs'

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import * as jwt from 'jsonwebtoken'

import { EnvironmentVariables } from '../../app/config'

import { TokenRepository } from './repositories'
import { Token, TokenSchema } from './repositories/models/schemas'
import { TokenService } from './services'

/**
 * Token domain module.
 *
 * Provides:
 * - JWT configuration (issuer, audience, algorithm, keys/secrets).
 * - Token persistence (TokenRepository + Mongo schema).
 * - TokenService for signing, verifying, and revoking tokens.
 *
 * Exported:
 * - TokenService (for other modules such as Authentication and User).
 */
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
  ],
  providers: [TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
