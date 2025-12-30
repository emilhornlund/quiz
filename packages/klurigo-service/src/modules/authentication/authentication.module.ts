import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { TokenModule } from '../token'
import { UserModule } from '../user'

import { AuthController } from './controllers'
import { AuthGuard } from './guards'
import { AuthService, GoogleAuthService } from './services'

@Module({
  imports: [EventEmitterModule, HttpModule, TokenModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthenticationModule {}
