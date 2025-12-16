import { NotFoundException } from '@nestjs/common'

export class ActiveGameNotFoundByIDException extends NotFoundException {
  constructor(id: string) {
    super(`Active game not found by id ${id}`)
  }
}

export class ActiveGameNotFoundByGamePINException extends NotFoundException {
  constructor(gamePIN: string) {
    super(`Active game not found by PIN ${gamePIN}`)
  }
}
