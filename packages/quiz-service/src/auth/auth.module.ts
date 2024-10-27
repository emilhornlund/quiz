import { readFileSync } from 'fs'

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import * as jwt from 'jsonwebtoken'

import { EnvironmentVariables } from '../app/config'

import { AuthGuard } from './guards'
import { AuthService } from './services'

const COMMON_JWT_OPTIONS: jwt.VerifyOptions | jwt.SignOptions = {
  algorithm: 'HS256',
  issuer: 'quiz',
  audience: process.env.NODE_ENV || 'development',
}

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        const jwtSecret = configService.get('JWT_SECRET')
        const jwtPrivateKeyPath = configService.get('JWT_PRIVATE_KEY_PATH')
        const jwtPublicKeyPath = configService.get('JWT_PUBLIC_KEY_PATH')

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
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
