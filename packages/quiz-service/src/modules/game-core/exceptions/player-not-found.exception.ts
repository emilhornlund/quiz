import { NotFoundException } from '@nestjs/common'

export class PlayerNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Player not found by id ${id}`)
  }
}
