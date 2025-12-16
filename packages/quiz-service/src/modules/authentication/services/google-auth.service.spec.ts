import { HttpService } from '@nestjs/axios'
import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { of, throwError } from 'rxjs'

import { GoogleAuthService } from './google-auth.service'
import { GoogleExchangeDto, GoogleProfileDto } from './models'

describe('GoogleAuthService', () => {
  let service: GoogleAuthService
  let httpService: HttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthService,
        {
          provide: HttpService,
          useValue: { post: jest.fn(), get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'GOOGLE_CLIENT_ID':
                  return 'test-client-id'
                case 'GOOGLE_CLIENT_SECRET':
                  return 'test-client-secret'
                case 'GOOGLE_REDIRECT_URI':
                  return 'http://localhost/callback'
                default:
                  return null
              }
            }),
          },
        },
      ],
    }).compile()

    service = module.get(GoogleAuthService)
    httpService = module.get(HttpService)
  })

  describe('exchangeCodeForAccessToken', () => {
    const code = 'auth-code'
    const verifier = 'pkce-verifier'

    it('should return access_token on success', async () => {
      const fakeResponse: GoogleExchangeDto = {
        access_token: 'abc123',
      }
      ;(httpService.post as jest.Mock).mockReturnValueOnce(
        of({ data: fakeResponse }),
      )

      const token = await service.exchangeCodeForAccessToken(code, verifier)
      expect(token).toBe('abc123')

      // ensure correct URL and headers
      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('https://oauth2.googleapis.com/token?'),
        null,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )
    })

    it('should throw UnauthorizedException on HTTP error', async () => {
      ;(httpService.post as jest.Mock).mockReturnValueOnce(
        throwError(() => new Error('network failure')),
      )

      await expect(
        service.exchangeCodeForAccessToken(code, verifier),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })

  describe('fetchGoogleProfile', () => {
    const accessToken = 'valid-token'

    it('should return profile on success', async () => {
      const fakeProfile: GoogleProfileDto = {
        id: '123',
        email: 'user@example.com',
        verified_email: true,
        name: 'Jane Doe',
        given_name: 'Jane',
        family_name: 'Doe',
        picture: 'http://img',
      }
      ;(httpService.get as jest.Mock).mockReturnValueOnce(
        of({ data: fakeProfile }),
      )

      const profile = await service.fetchGoogleProfile(accessToken)
      expect(profile).toEqual(fakeProfile)

      expect(httpService.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
    })

    it('should throw UnauthorizedException on HTTP error', async () => {
      ;(httpService.get as jest.Mock).mockReturnValueOnce(
        throwError(() => new Error('expired token')),
      )

      await expect(
        service.fetchGoogleProfile(accessToken),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })
})
