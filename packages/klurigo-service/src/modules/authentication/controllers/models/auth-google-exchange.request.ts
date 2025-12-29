import {
  AuthGoogleExchangeRequestDto,
  GOOGLE_OAUTH_CODE_REGEX,
  GOOGLE_OAUTH_CODE_VERIFIER_REGEX,
} from '@klurigo/common'
import { ApiProperty } from '@nestjs/swagger'
import { Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Data Transfer Object for exchanging a Google OAuth authorization code
 * and PKCE code verifier for obtaining access and refresh tokens.
 */
export class AuthGoogleExchangeRequest implements AuthGoogleExchangeRequestDto {
  /**
   * Authorization code returned by Google OAuth after user consent.
   * This code, together with the PKCE verifier, is used to request tokens.
   */
  @ApiProperty({
    title: 'Authorization Code',
    description: 'Code returned by Google OAuth after user consent.',
    type: String,
    pattern: GOOGLE_OAUTH_CODE_REGEX.source,
    example: '4/0AX4XfWgDwZqp3xM0f2JjZb6X_ExampleCode',
  })
  @MinLength(10, { message: 'Code must be at least 10 characters long.' })
  @MaxLength(512, { message: 'Code must be at most 512 characters long.' })
  @Matches(GOOGLE_OAUTH_CODE_REGEX, {
    message:
      'Invalid code format. Only URL-safe characters (“A–Z”, “a–z”, “0–9”, “-”, “_”, “/”) are allowed.',
  })
  readonly code: string

  /**
   * The PKCE code verifier originally generated and sent in the OAuth request.
   * Must match the verifier used to generate the code challenge.
   */
  @ApiProperty({
    title: 'PKCE Code Verifier',
    description: 'Original PKCE code verifier sent in the OAuth request.',
    type: String,
    pattern: GOOGLE_OAUTH_CODE_VERIFIER_REGEX.source,
    example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  })
  @MinLength(43, {
    message: 'Code verifier must be at least 43 characters long.',
  })
  @MaxLength(128, {
    message: 'Code verifier must be at most 128 characters long.',
  })
  @Matches(GOOGLE_OAUTH_CODE_VERIFIER_REGEX, {
    message:
      'Invalid code verifier format. Only unreserved URI characters (“A–Z”, “a–z”, “0–9”, “-”, “.”, “_”, “~”) are allowed.',
  })
  readonly codeVerifier: string
}
