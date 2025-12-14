import { forwardRef, Module } from '@nestjs/common'

import { GameModule } from '../game'
import { QuizModule } from '../modules/quiz'
import { UserModule } from '../modules/user'

import { UserMigrationController } from './controllers'
import { MigrationService } from './services'

/**
 * Module for managing user-related operations.
 */
@Module({
  imports: [
    forwardRef(() => GameModule),
    forwardRef(() => QuizModule),
    forwardRef(() => UserModule),
  ],
  controllers: [UserMigrationController],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
