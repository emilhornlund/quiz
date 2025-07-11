import { AuthProvider } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { LocalUser } from '../../src/user/repositories'

export const MOCK_PRIMARY_USER_EMAIL = 'user@example.com'
export const MOCK_PRIMARY_USER_GIVEN_NAME = 'John'
export const MOCK_PRIMARY_USER_FAMILY_NAME = 'Appleseed'
export const MOCK_PRIMARY_USER_DEFAULT_NICKNAME = 'FrostyBear'

export const MOCK_SECONDARY_USER_EMAIL = 'another.user@example.com'
export const MOCK_SECONDARY_USER_GIVEN_NAME = 'Test'
export const MOCK_SECONDARY_USER_FAMILY_NAME = 'Testsson'
export const MOCK_SECONDARY_USER_DEFAULT_NICKNAME = 'WhiskerFox'

export const MOCK_TERTIARY_USER_EMAIL = 'tertiary.user@example.com'
export const MOCK_TERTIARY_USER_GIVEN_NAME = 'Tertiary'
export const MOCK_TERTIARY_USER_FAMILY_NAME = 'User'
export const MOCK_TERTIARY_USER_DEFAULT_NICKNAME = 'ShadowWhirlwind'

export const MOCK_QUATERNARY_USER_EMAIL = 'quaternary.user@example.com'
export const MOCK_QUATERNARY_USER_GIVEN_NAME = 'Quaternary'
export const MOCK_QUATERNARY_USER_FAMILY_NAME = 'User'
export const MOCK_QUATERNARY_USER_DEFAULT_NICKNAME = 'PuddingPop'

export const MOCK_PRIMARY_PASSWORD = 'Super#SecretPa$$w0rd123'
export const MOCK_PRIMARY_INVALID_PASSWORD = 'Super#$ecretPassw0rd123'
export const MOCK_DEFAULT_HASHED_PASSWORD =
  '$2b$10$.xzhAfwhLmb2Nbe5i2jRB.j4IUuWqnDvgUuQ/AZ/unHhOPJcJyVJ6'
export const MOCK_SECONDARY_PASSWORD = 'Tr0ub4dor&3NewP@ssw0rd!'
export const MOCK_WEAK_PASSWORD = 'not-a-strong-password'

export function buildMockPrimaryUser(user?: Partial<LocalUser>): LocalUser {
  const now = new Date()
  return {
    _id: uuidv4(),
    authProvider: AuthProvider.Local,
    email: MOCK_PRIMARY_USER_EMAIL,
    hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
    givenName: MOCK_PRIMARY_USER_GIVEN_NAME,
    familyName: MOCK_PRIMARY_USER_FAMILY_NAME,
    defaultNickname: MOCK_PRIMARY_USER_DEFAULT_NICKNAME,
    createdAt: now,
    updatedAt: now,
    ...(user ?? {}),
  }
}

export function buildMockSecondaryUser(user?: Partial<LocalUser>): LocalUser {
  const now = new Date()
  return {
    _id: uuidv4(),
    authProvider: AuthProvider.Local,
    email: MOCK_SECONDARY_USER_EMAIL,
    hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
    givenName: MOCK_SECONDARY_USER_GIVEN_NAME,
    familyName: MOCK_SECONDARY_USER_FAMILY_NAME,
    defaultNickname: MOCK_SECONDARY_USER_DEFAULT_NICKNAME,
    createdAt: now,
    updatedAt: now,
    ...(user ?? {}),
  }
}

export function buildMockTertiaryUser(user?: Partial<LocalUser>): LocalUser {
  const now = new Date()
  return {
    _id: uuidv4(),
    authProvider: AuthProvider.Local,
    email: MOCK_TERTIARY_USER_EMAIL,
    hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
    givenName: MOCK_TERTIARY_USER_GIVEN_NAME,
    familyName: MOCK_TERTIARY_USER_FAMILY_NAME,
    defaultNickname: MOCK_TERTIARY_USER_DEFAULT_NICKNAME,
    createdAt: now,
    updatedAt: now,
    ...(user ?? {}),
  }
}

export function buildMockQuaternaryUser(user?: Partial<LocalUser>): LocalUser {
  const now = new Date()
  return {
    _id: uuidv4(),
    authProvider: AuthProvider.Local,
    email: MOCK_QUATERNARY_USER_EMAIL,
    hashedPassword: MOCK_DEFAULT_HASHED_PASSWORD,
    givenName: MOCK_QUATERNARY_USER_GIVEN_NAME,
    familyName: MOCK_QUATERNARY_USER_FAMILY_NAME,
    defaultNickname: MOCK_QUATERNARY_USER_DEFAULT_NICKNAME,
    createdAt: now,
    updatedAt: now,
    ...(user ?? {}),
  }
}
