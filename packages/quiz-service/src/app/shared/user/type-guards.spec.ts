import { AuthProvider } from '@quiz/common'

import { isGoogleUser, isLocalUser, isNoneMigratedUser } from './type-guards'

describe('User Type Guards', () => {
  describe('isLocalUser', () => {
    it('should return true for a valid local user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Local,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        hashedPassword: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(user)).toBe(true)
    })

    it('should return false for a Google user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Google,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        googleUserId: 'google123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(user)).toBe(false)
    })

    it('should return false for a none user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.None,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(user)).toBe(false)
    })

    it('should return false when hashedPassword is missing', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Local,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(user)).toBe(false)
    })

    it('should return false when hashedPassword is not a string', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Local,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        hashedPassword: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(user)).toBe(false)
    })

    it('should return false for null input', () => {
      expect(isLocalUser(null)).toBe(false)
    })

    it('should return false for undefined input', () => {
      expect(isLocalUser(undefined)).toBe(false)
    })

    it('should return false for non-object input', () => {
      expect(isLocalUser('string')).toBe(false)
      expect(isLocalUser(123)).toBe(false)
      expect(isLocalUser(true)).toBe(false)
      expect(isLocalUser([])).toBe(false)
    })
  })

  describe('isGoogleUser', () => {
    it('should return true for a valid Google user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Google,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        googleUserId: 'google123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isGoogleUser(user)).toBe(true)
    })

    it('should return false for a local user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Local,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        hashedPassword: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isGoogleUser(user)).toBe(false)
    })

    it('should return false for a none user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.None,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isGoogleUser(user)).toBe(false)
    })

    it('should return false when googleUserId is missing', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Google,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isGoogleUser(user)).toBe(false)
    })

    it('should return false when googleUserId is not a string', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Google,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        googleUserId: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isGoogleUser(user)).toBe(false)
    })

    it('should return false for null input', () => {
      expect(isGoogleUser(null)).toBe(false)
    })

    it('should return false for undefined input', () => {
      expect(isGoogleUser(undefined)).toBe(false)
    })

    it('should return false for non-object input', () => {
      expect(isGoogleUser('string')).toBe(false)
      expect(isGoogleUser(123)).toBe(false)
      expect(isGoogleUser(true)).toBe(false)
      expect(isGoogleUser([])).toBe(false)
    })
  })

  describe('isNoneMigratedUser', () => {
    it('should return true for a valid none user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.None,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isNoneMigratedUser(user)).toBe(true)
    })

    it('should return false for a local user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Local,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        hashedPassword: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isNoneMigratedUser(user)).toBe(false)
    })

    it('should return false for a Google user', () => {
      const user = {
        _id: '123',
        authProvider: AuthProvider.Google,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        googleUserId: 'google123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isNoneMigratedUser(user)).toBe(false)
    })

    it('should return false for null input', () => {
      expect(isNoneMigratedUser(null)).toBe(false)
    })

    it('should return false for undefined input', () => {
      expect(isNoneMigratedUser(undefined)).toBe(false)
    })

    it('should return false for non-object input', () => {
      expect(isNoneMigratedUser('string')).toBe(false)
      expect(isNoneMigratedUser(123)).toBe(false)
      expect(isNoneMigratedUser(true)).toBe(false)
      expect(isNoneMigratedUser([])).toBe(false)
    })
  })

  describe('Type Guard Behavior with Additional Properties', () => {
    it('should handle users with optional properties', () => {
      const localUser = {
        _id: '123',
        authProvider: AuthProvider.Local,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        hashedPassword: 'hashedpassword123',
        givenName: 'John',
        familyName: 'Doe',
        unverifiedEmail: 'new@example.com',
        lastLoggedInAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(localUser)).toBe(true)
      expect(isGoogleUser(localUser)).toBe(false)
      expect(isNoneMigratedUser(localUser)).toBe(false)
    })

    it('should handle users with extra unknown properties', () => {
      const googleUser = {
        _id: '123',
        authProvider: AuthProvider.Google,
        email: 'test@example.com',
        defaultNickname: 'testuser',
        googleUserId: 'google123',
        createdAt: new Date(),
        updatedAt: new Date(),
        extraProperty: 'should not affect type guard',
        anotherExtra: 42,
      }

      expect(isGoogleUser(googleUser)).toBe(true)
      expect(isLocalUser(googleUser)).toBe(false)
      expect(isNoneMigratedUser(googleUser)).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty objects', () => {
      const emptyObject = {}

      expect(isLocalUser(emptyObject)).toBe(false)
      expect(isGoogleUser(emptyObject)).toBe(false)
      expect(isNoneMigratedUser(emptyObject)).toBe(false)
    })

    it('should handle objects with only authProvider', () => {
      const onlyAuthProvider = {
        authProvider: AuthProvider.Local,
      }

      expect(isLocalUser(onlyAuthProvider)).toBe(false)
      expect(isGoogleUser(onlyAuthProvider)).toBe(false)
      expect(isNoneMigratedUser(onlyAuthProvider)).toBe(false)
    })

    it('should handle objects with invalid authProvider values', () => {
      const invalidAuthProvider = {
        _id: '123',
        authProvider: 'INVALID',
        email: 'test@example.com',
        defaultNickname: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(isLocalUser(invalidAuthProvider)).toBe(false)
      expect(isGoogleUser(invalidAuthProvider)).toBe(false)
      expect(isNoneMigratedUser(invalidAuthProvider)).toBe(false)
    })
  })
})
