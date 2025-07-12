import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Authority, TokenDto, TokenScope } from '@quiz/common'

import {
  JwtPayload,
  RequiredAuthorities,
  RequiresScopes,
} from '../../auth/controllers/decorators'
import { UserService } from '../services'

/**
 * Controller for email verification and other user-auth endpoints.
 */
@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class UserAuthController {
  /**
   * Initializes the UserAuthController.
   *
   * @param userService Service for user operations.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Verifies a user's email address using a signed JWT.
   *
   * Checks that the `email` claim on the payload matches the user's
   * `unverifiedEmail` and, if so, marks it as verified.
   *
   * @param payload - JWT payload containing `sub` (userId) and `email` claim.
   * @returns A promise that resolves with no content on success.
   */
  @Post('/email/verify')
  @RequiresScopes(TokenScope.User)
  @RequiredAuthorities(Authority.VerifyEmail)
  @ApiOperation({
    summary: 'Verify user email',
    description:
      'Consume a signed email-verification token and mark the user’s email as verified.',
  })
  @ApiNoContentResponse({
    description: 'Email successfully verified; no content returned.',
  })
  @ApiBadRequestResponse({
    description:
      'The provided email does not match the user’s pending unverified email.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user lacks the VerifyEmail authority.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async verifyEmail(@JwtPayload() payload: TokenDto): Promise<void> {
    if (!payload.email || !(typeof payload.email === 'string')) {
      throw new UnauthorizedException('Unauthorized')
    }
    return this.userService.verifyEmail(payload.sub, payload.email)
  }
}
