import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from '@nestjs-modules/mailer'

import { EnvironmentVariables } from '../../../app/config'

import { EmailService } from './email.service'

describe('EmailService', () => {
  let service: EmailService
  let configService: jest.Mocked<ConfigService<EnvironmentVariables>>
  let mailerService: jest.Mocked<MailerService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<EmailService>(EmailService)
    configService = module.get(ConfigService)
    mailerService = module.get(MailerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendWelcomeEmail', () => {
    const to = 'test@example.com'
    const verificationLink = 'https://example.com/verify'

    it('should send welcome email with verification link when EMAIL_ENABLED is true', async () => {
      configService.get.mockReturnValue(true)

      await service.sendWelcomeEmail(to, verificationLink)

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        from: 'no-reply@klurigo.com',
        to,
        subject: 'Welcome to Klurigo!',
        text: expect.stringContaining('Thank you for signing up for Klurigo'),
        html: expect.stringContaining('Thank you for signing up for Klurigo'),
      })
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1)
    })

    it('should send welcome email without verification link when EMAIL_ENABLED is true', async () => {
      configService.get.mockReturnValue(true)

      await service.sendWelcomeEmail(to)

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        from: 'no-reply@klurigo.com',
        to,
        subject: 'Welcome to Klurigo!',
        text: expect.stringContaining('Thank you for signing up for Klurigo'),
        html: expect.stringContaining('Thank you for signing up for Klurigo'),
      })
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1)
    })

    it('should not send email when EMAIL_ENABLED is false', async () => {
      configService.get.mockReturnValue(false)

      await service.sendWelcomeEmail(to, verificationLink)

      expect(mailerService.sendMail).not.toHaveBeenCalled()
    })
  })

  describe('sendVerificationEmail', () => {
    const to = 'test@example.com'
    const verificationLink = 'https://example.com/verify'

    it('should send verification email when EMAIL_ENABLED is true', async () => {
      configService.get.mockReturnValue(true)

      await service.sendVerificationEmail(to, verificationLink)

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        from: 'no-reply@klurigo.com',
        to,
        subject: 'Confirm Your New Email Address for Klurigo',
        text: expect.stringContaining(
          'change the email address on your Klurigo account',
        ),
        html: expect.stringContaining(
          'change the email address on your Klurigo account',
        ),
      })
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1)
    })

    it('should not send email when EMAIL_ENABLED is false', async () => {
      configService.get.mockReturnValue(false)

      await service.sendVerificationEmail(to, verificationLink)

      expect(mailerService.sendMail).not.toHaveBeenCalled()
    })
  })

  describe('sendPasswordResetEmail', () => {
    const to = 'test@example.com'
    const passwordResetLink = 'https://example.com/reset'

    it('should send password reset email when EMAIL_ENABLED is true', async () => {
      configService.get.mockReturnValue(true)

      await service.sendPasswordResetEmail(to, passwordResetLink)

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        from: 'no-reply@klurigo.com',
        to,
        subject: 'Reset Your Klurigo Password',
        text: expect.stringContaining(
          'reset the password for your Klurigo account',
        ),
        html: expect.stringContaining(
          'reset the password for your Klurigo account',
        ),
      })
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1)
    })

    it('should not send email when EMAIL_ENABLED is false', async () => {
      configService.get.mockReturnValue(false)

      await service.sendPasswordResetEmail(to, passwordResetLink)

      expect(mailerService.sendMail).not.toHaveBeenCalled()
    })
  })

  describe('sendEmail error handling', () => {
    it('should log error when sendMail throws', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation()
      configService.get.mockReturnValue(true)
      mailerService.sendMail.mockRejectedValue(new Error('SMTP error'))

      await service.sendWelcomeEmail('test@example.com')

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send email'),
        expect.any(String),
      )
      loggerSpy.mockRestore()
    })
  })
})
