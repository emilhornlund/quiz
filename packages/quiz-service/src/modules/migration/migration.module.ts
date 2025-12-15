import { forwardRef, Module } from '@nestjs/common'

import { GameModule } from '../game'
import { QuizModule } from '../quiz'
import { UserModule } from '../user'

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
