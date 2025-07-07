import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface'

import { EnvironmentVariables } from '../../app/config'

/**
 * Service responsible for sending emails.
 */
@Injectable()
export class EmailService {
  // Logger instance for recording service operations.
  private readonly logger: Logger = new Logger(EmailService.name)

  /**
   * Initializes the EmailService.
   *
   * @param configService - Service to access environment variables.
   * @param mailerService Service for performing email operations.
   */
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Sends an email using the configured MailerService.
   *
   * @param options - An object containing:
   *   - `to`: Recipient email address.
   *   - `subject`: Subject line of the email.
   *   - `text`: Plain-text body of the email.
   *   - `html`: HTML body of the email.
   * @returns A promise that resolves when the email has been sent.
   */
  public async sendEmail(
    options: Pick<ISendMailOptions, 'to' | 'subject' | 'text' | 'html'>,
  ) {
    if (this.configService.get('EMAIL_ENABLED') === false) {
      this.logger.debug('Skip sending email, disabled.')
      return
    }
    try {
      await this.mailerService.sendMail({
        from: 'no-reply@klurigo.com',
        ...options,
      })
    } catch (error) {
      const { message, stack } = error as Error
      this.logger.error(`Failed to send email: '${message}'.`, stack)
    }
  }
}
