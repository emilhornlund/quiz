import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthProvider } from '@quiz/common'

import { UserController, UserProfileController } from './controllers'
import { UserRepository, UserService } from './services'
import { LocalUserSchema, User, UserSchema } from './services/models/schemas'

/**
 * Module for managing user-related operations.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [{ name: AuthProvider.Local, schema: LocalUserSchema }],
      },
    ]),
  ],
  controllers: [UserController, UserProfileController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
