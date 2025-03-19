import { HttpModule } from '@nestjs/axios'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { MediaController } from './controllers'
import { MediaService, PexelsMediaSearchService } from './services'

/**
 * Module for managing media-related operations.
 */
@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MediaController],
  providers: [Logger, ConfigService, MediaService, PexelsMediaSearchService],
  exports: [MediaService],
})
export class MediaModule {}
