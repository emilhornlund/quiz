import { join } from 'path'

import { parseBsonDocuments } from './bson.utils'
import { extractValueOrThrow } from './extract-value.utils'

/**
 * Provides bidirectional lookups between client IDs and player entities.
 *
 * - `findPlayerIdByClientId`
 * - `findPlayerNicknameByClientId`
 * - `findPlayerNicknameByPlayerId`
 */
export interface ClientPlayerMapper {
  clients: Array<{
    id: string
    player: { id: string; nickname: string }
  }>
  players: Array<{ id: string; nickname: string }>
  findPlayerIdByClientId: (clientId: string) => string
  findPlayerNicknameByClientId: (clientId: string) => string
  findPlayerNicknameByPlayerId: (playerId: string) => string
}

/**
 * Builds a mapper object between client IDs and player IDs/nicknames by reading
 * `clients.bson` and `players.bson`.
 *
 * @param inputDir - Directory containing the BSON dump files.
 * @param bsonFiles - Filenames of all `.bson` files in that directory.
 * @returns A `ClientPlayerMapper` capable of looking up player IDs and nicknames.
 */
export function parseClientPlayerMapper(
  inputDir: string,
  bsonFiles: string[],
): ClientPlayerMapper {
  const clientBsonFile = bsonFiles.find((f) => f.endsWith('clients.bson'))
  const playerBsonFile = bsonFiles.find((f) => f.endsWith('players.bson'))

  let clients: ClientPlayerMapper['clients'] = []
  let players: ClientPlayerMapper['players'] = []

  if (clientBsonFile && playerBsonFile) {
    const clientBsonPath = join(inputDir, clientBsonFile)
    const playerBsonPath = join(inputDir, playerBsonFile)

    const clientDocuments = parseBsonDocuments(clientBsonPath)
    const playerDocuments = parseBsonDocuments(playerBsonPath)

    players = playerDocuments.map((player) => ({
      id: extractValueOrThrow<string>(player, {}, '_id'),
      nickname: extractValueOrThrow<string>(player, {}, 'nickname'),
    }))

    clients = clientDocuments.map((client) => {
      const playerId = extractValueOrThrow<string>(client, {}, 'player')
      const player = players.find((player) => player.id === playerId)
      if (!player) {
        throw new Error(`Could not find player with id ${playerId}`)
      }
      return {
        id: extractValueOrThrow<string>(client, {}, '_id'),
        player,
      }
    })
  }

  const findPlayerIdByClientId = (clientId: string): string => {
    const playerId = clients.find((client) => client.id === clientId)?.player
      ?.id
    if (!playerId) {
      throw new Error(`Could not find player id for client ${clientId}`)
    }
    return playerId
  }

  const findPlayerNicknameByClientId = (clientId: string): string => {
    const nickname = clients.find((client) => client.id === clientId)?.player
      ?.nickname
    if (!nickname) {
      throw new Error(`Could not find player nickname for client ${clientId}`)
    }
    return nickname
  }

  const findPlayerNicknameByPlayerId = (playerId: string): string => {
    const nickname = players.find((player) => player.id === playerId)?.nickname
    if (!nickname) {
      throw new Error(`Could not find player nickname for player ${playerId}`)
    }
    return nickname
  }

  return {
    clients,
    players,
    findPlayerIdByClientId,
    findPlayerNicknameByClientId,
    findPlayerNicknameByPlayerId,
  }
}
