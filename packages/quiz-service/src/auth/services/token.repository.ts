import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Token, TokenModel } from './models/schemas'

/**
 * description here
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
   * description here
   *
   * @param id – description here
   * @returns The matching Token document or null.
   */
  public async findByIdOrThrow(id: string): Promise<Token | null> {
    return this.tokenModel.findById(id)
  }

  /**
   * description here
   *
   * @param pairId - description here
   * @returns description here
   */
  public async deleteByPairId(pairId: string): Promise<void> {
    await this.tokenModel.deleteMany({ pairId })
  }
}
