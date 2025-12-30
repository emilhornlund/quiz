import { GameParticipantType, TokenScope } from '@klurigo/common'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/mongoose'

import {
  DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME,
  DEFAULT_GAME_AUTHORITIES,
  DEFAULT_USER_AUTHORITIES,
} from '../../src/app/shared/token'
import { User, UserModel } from '../../src/modules/user/repositories'
import { buildMockPrimaryUser } from '../data'

export async function createDefaultUserAndAuthenticate(
  app: INestApplication,
  mockUser?: Partial<User>,
): Promise<{ accessToken: string; user: User }> {
  const userModel = app.get<UserModel>(getModelToken(User.name))
  const user = await userModel.create({
    ...buildMockPrimaryUser(),
    ...mockUser,
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

  return { accessToken, user }
}

export async function authenticateGame(
  app: INestApplication,
  gameId: string,
  participantId: string,
  participantType: GameParticipantType,
): Promise<string> {
  const jwtService = app.get<JwtService>(JwtService)
  return jwtService.signAsync(
    {
      scope: TokenScope.Game,
      authorities: DEFAULT_GAME_AUTHORITIES,
      gameId,
      participantType,
    },
    {
      subject: participantId,
      expiresIn: DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME,
    },
  )
}
