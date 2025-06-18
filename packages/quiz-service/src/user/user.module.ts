import { Module } from '@nestjs/common'

import { UserController } from './controllers'
import { UserService } from './services'

/**
 * Module for managing user-related operations.
 */
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
