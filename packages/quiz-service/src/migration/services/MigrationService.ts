import { Injectable } from '@nestjs/common'

import { GameRepository } from '../../game/services'

@Injectable()
export class MigrationService {
  constructor(private readonly gameRepository: GameRepository) {}
}
