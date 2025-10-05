import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { BaseRepository } from '../../app/shared/repository'
import { TokenNotFoundException } from '../exceptions'

import { Token, TokenModel } from './models/schemas'

/**
 * Repository for managing token documents in MongoDB.
 *
 * Extends BaseRepository to provide common CRUD operations and adds token-specific methods.
 */
@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  /**
   * Constructs the TokenRepository.
   *
   * @param tokenModel - The Mongoose model representing the Token schema.
   */
  public constructor(
    @InjectModel(Token.name) protected readonly tokenModel: TokenModel,
  ) {
    super(tokenModel, 'Token')
  }

  /**
   * Creates and persists a new token record.
   *
   * @returns The newly created Token document.
   */
  public async createToken(token: Partial<Token>): Promise<Token> {
    return this.create(token)
  }

  /**
   * Retrieves a token document by its unique identifier.
   *
   * @param id – The JWT ID (`jti`) of the token.
   * @returns The matching Token document or `null` if not found.
   */
  public async findTokenById(id: string): Promise<Token | null> {
    return this.findById(id)
  }

  /**
   * Retrieves a token document by its unique identifier, or throws if not found.
   *
   * @param id – The JWT ID (`jti`) of the token.
   * @returns The matching Token document.
   * @throws TokenNotFoundException if no token exists with the given `id`.
   */
  public async findTokenByIdOrThrow(id: string): Promise<Token> {
    const document = await this.findById(id)
    if (!document) {
      throw new TokenNotFoundException(id)
    }
    return document
  }

  /**
   * Deletes all token documents associated with a given pair ID.
   *
   * @param pairId - Identifier linking access and refresh tokens.
   * @returns Promise that resolves when deletion is complete.
   */
  public async deleteTokensByPairId(pairId: string): Promise<number> {
    return this.deleteMany({ pairId })
  }
}
