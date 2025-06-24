import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenScope } from '@quiz/common'

import {
  DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME,
  DEFAULT_USER_AUTHORITIES,
} from '../../src/auth/services/utils'
import { UserRepository } from '../../src/user/services'
import {
  MOCK_DEFAULT_USER_EMAIL,
  MOCK_DEFAULT_USER_FAMILY_NAME,
  MOCK_DEFAULT_USER_GIVEN_NAME,
  MOCK_DEFAULT_USER_HASHED_PASSWORD,
} from '../data'

export async function createDefaultUserAndAuthenticate(
  app: INestApplication,
): Promise<{ accessToken: string; userId: string }> {
  const userRepository = app.get<UserRepository>(UserRepository)
  const user = await userRepository.createLocalUser({
    email: MOCK_DEFAULT_USER_EMAIL,
    hashedPassword: MOCK_DEFAULT_USER_HASHED_PASSWORD,
    givenName: MOCK_DEFAULT_USER_GIVEN_NAME,
    familyName: MOCK_DEFAULT_USER_FAMILY_NAME,
  })

  const jwtService = app.get<JwtService>(JwtService)
  const accessToken = await jwtService.signAsync(
    {
      scope: TokenScope.User,
      authorities: DEFAULT_USER_AUTHORITIES,
    },
    {
      subject: user._id,
      expiresIn: DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME,
    },
  )

  return { accessToken, userId: user._id }
}
