import { forwardRef, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthProvider } from '@quiz/common'

import { AuthModule } from '../auth'
import { MigrationModule } from '../migration'
import { EmailModule } from '../modules/email'

import {
  UserAuthController,
  UserController,
  UserProfileController,
} from './controllers'
import {
  GoogleUserSchema,
  LocalUserSchema,
  NoneUserSchema,
  User,
  UserRepository,
  UserSchema,
} from './repositories'
import { UserEventHandler, UserService } from './services'

/**
 * Module for managing user-related operations.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [
          { name: AuthProvider.None, schema: NoneUserSchema },
          { name: AuthProvider.Local, schema: LocalUserSchema },
          { name: AuthProvider.Google, schema: GoogleUserSchema },
        ],
      },
    ]),
    EventEmitterModule,
    forwardRef(() => AuthModule),
    EmailModule,
    forwardRef(() => MigrationModule),
  ],
  controllers: [UserController, UserProfileController, UserAuthController],
  providers: [UserService, UserRepository, UserEventHandler],
  exports: [UserService, UserRepository],
})
export class UserModule {}
