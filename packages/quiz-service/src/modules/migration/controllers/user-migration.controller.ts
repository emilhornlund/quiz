import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Authority, TokenScope } from '@quiz/common'

import {
  PrincipalId,
  RequiredAuthorities,
  RequiresScopes,
} from '../../authentication/controllers/decorators'
import { MigrationService } from '../services'

import { UserMigrationRequest } from './models'

/**
 * Controller for managing user-migration-related operations.
 */
@ApiBearerAuth()
@ApiTags('user', 'migration')
@RequiresScopes(TokenScope.User)
@RequiredAuthorities(Authority.User)
@Controller('/migration/user')
export class UserMigrationController {
  // Logger instance for recording user-migration controller operations.
  private readonly logger: Logger = new Logger(UserMigrationController.name)

  /**
   * Initializes the UserMigrationController.
   *
   * @param migrationService - Service for managing migration operations.
   */
  constructor(private readonly migrationService: MigrationService) {}

  /**
   * Links a legacy anonymous player to the authenticated user.
   *
   * Accepts a migration token that represents the legacy player and
   * migrates its data into the requester’s user account.
   *
   * @param userId - The ID of the authenticated user performing the migration.
   * @param request - The migration request payload containing the token.
   * @returns Resolves with no content if migration succeeds.
   */
  @Post()
  @ApiOperation({
    summary: 'Migrate a legacy player to the authenticated user',
    description:
      'Uses a migration token to link a legacy anonymous player to the current user account.',
  })
  @ApiBody({
    description: 'Payload containing the migration token.',
    type: UserMigrationRequest,
  })
  @ApiNoContentResponse({
    description: 'Migration completed successfully.',
  })
  @ApiBadRequestResponse({
    description:
      'The request is invalid. This may occur if the migration token is missing, malformed, or fails validation.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access. The user must be authenticated.',
  })
  @ApiNotFoundResponse({
    description: 'Legacy player or user profile not found.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async migrateUser(
    @PrincipalId() userId: string,
    @Body() request: UserMigrationRequest,
  ): Promise<void> {
    try {
      await this.migrationService.migrateLegacyPlayerUser(
        request.migrationToken,
        userId,
        undefined,
      )
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.debug(
        `Failed to migrate legacy player user using token '${request.migrationToken}' for existing user '${userId}': '${message}'.`,
        stack,
      )
    }
  }
}
