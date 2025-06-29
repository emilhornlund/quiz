import { EventEmitter2 } from '@nestjs/event-emitter'

import { AuthService } from './auth.service'
import { USER_LOGIN_EVENT_KEY } from './utils'

describe('AuthService', () => {
  let service: AuthService
  let eventEmitter: EventEmitter2
  let logger: { error: jest.Mock }

  beforeEach(() => {
    // We only care about emitUserLoginEvent, so other deps can be dummy objects.
    eventEmitter = new EventEmitter2()
    logger = { error: jest.fn() }

    service = new AuthService(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* userService    */ {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* gameRepository */ {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* jwtService     */ {} as any,
      /* eventEmitter   */ eventEmitter,
    )

    // Override the internal logger so we can spy on .error()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).logger = logger
  })

  describe('emitUserLoginEvent', () => {
    it('should emit a UserLoginEvent with correct payload', async () => {
      const emitSpy = jest.spyOn(eventEmitter, 'emit')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (service as any).emitUserLoginEvent('user-123')

      expect(emitSpy).toHaveBeenCalledWith(
        USER_LOGIN_EVENT_KEY,
        expect.objectContaining({
          userId: 'user-123',
          date: expect.any(Date),
        }),
      )
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should catch and log errors thrown by eventEmitter.emit', async () => {
      jest.spyOn(eventEmitter, 'emit').mockImplementation(() => {
        throw new Error('boom happened')
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (service as any).emitUserLoginEvent('user-456')

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          `Failed to emit user login event for userId 'user-456': 'boom happened.'`,
        ),
        expect.any(String), // stack trace
      )
    })
  })
})
