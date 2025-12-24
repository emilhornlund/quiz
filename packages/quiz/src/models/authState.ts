import type { GameTokenDto, TokenDto } from '@quiz/common'
import { TokenScope, TokenType } from '@quiz/common'

/**
 * Represents the decoded payload for a token in a given scope.
 *
 * @template S The TokenScope (User or Game) whose claims are included.
 */
export type ScopePayload<S extends TokenScope> = (S extends TokenScope.User
  ? Pick<TokenDto, 'sub' | 'exp' | 'authorities'>
  : Pick<
      GameTokenDto,
      'sub' | 'exp' | 'authorities' | 'gameId' | 'participantType'
    >) & { token: string }

/**
 * In-memory authentication state mapping each TokenScope to its
 * decoded payloads, keyed by TokenType.
 */
export type AuthState = Partial<{
  [S in TokenScope]: {
    [T in TokenType]: ScopePayload<S>
  }
}>
