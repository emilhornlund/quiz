import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Token, TokenModel } from './models/schemas'

/**
 * Repository for managing token documents in MongoDB.
 *
 * Provides methods to create, retrieve, and delete token records.
 */
@Injectable()
export class TokenRepository {
  // Logger instance for recording repository operations.
  private readonly logger: Logger = new Logger(TokenRepository.name)

  /**
   * Constructs the TokenRepository.
   *
   * @param tokenModel - The Mongoose model representing the Token schema.
   */
  public constructor(
    @InjectModel(Token.name) private readonly tokenModel: TokenModel,
  ) {}

  /**
   * Creates and persists a new token record.
   *
   * @returns The newly created Token document.
   */
  public async create(token: Token): Promise<Token> {
    return new this.tokenModel(token).save()
  }

  /**
   * Retrieves a token document by its unique identifier.
   *
   * @param id – The JWT ID (`jti`) of the token.
   * @returns The matching Token document or `null` if not found.
   */
  public async findByIdOrThrow(id: string): Promise<Token | null> {
    return this.tokenModel.findById(id)
  }

  /**
   * Deletes all token documents associated with a given pair ID.
   *
   * @param pairId - Identifier linking access and refresh tokens.
   * @returns Promise that resolves when deletion is complete.
   */
  public async deleteByPairId(pairId: string): Promise<void> {
    await this.tokenModel.deleteMany({ pairId })
  }
}
