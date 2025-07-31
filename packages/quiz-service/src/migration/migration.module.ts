import { forwardRef, Module } from '@nestjs/common'

import { GameModule } from '../game'
import { QuizModule } from '../quiz'
import { UserModule } from '../user'

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
  controllers: [],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
