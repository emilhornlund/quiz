import { NotFoundException } from '@nestjs/common'

export class ActiveGameNotFoundException extends NotFoundException {
  constructor(gamePIN: string) {
    super(`Active game not found by PIN ${gamePIN}`)
  }
}
