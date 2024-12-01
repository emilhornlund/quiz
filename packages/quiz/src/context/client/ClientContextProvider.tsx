import { PlayerResponseDto } from '@quiz/common'
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useQuizService } from '../../utils/use-quiz-service.tsx'

import { ClientContext, ClientContextInfo } from './ClientContext.tsx'

type ClientContextInfoStorage = Pick<
  ClientContextInfo,
  'clientId' | 'token' | 'player'
>

export interface ClientContextProviderProps {
  children: ReactNode | ReactNode[]
}

/**
 * Utility to save client info in localStorage.
 *
 * @param info - The client info to save.
 */
const saveClientInfoToStorage = (info: ClientContextInfoStorage) => {
  localStorage.setItem('client', JSON.stringify(info))
}

/**
 * Utility to load client info from localStorage.
 *
 * @returns The client info if present, otherwise undefined.
 */
const loadClientInfoFromStorage = (): ClientContextInfoStorage | undefined => {
  const rawStoredInfo = localStorage.getItem('client')
  return rawStoredInfo ? JSON.parse(rawStoredInfo) : undefined
}

const ClientContextProvider: FC<ClientContextProviderProps> = ({
  children,
}) => {
  const { authenticateClient, getCurrentPlayer } = useQuizService()

  const [clientId, setClientId] = useState<string>()
  const [token, setToken] = useState<string>()
  const [player, setPlayer] =
    useState<Pick<PlayerResponseDto, 'id' | 'nickname'>>()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  /**
   * Authenticate the client and update state with the retrieved info.
   *
   * @param clientId - The client ID to authenticate.
   * @returns A promise resolving with the new token, or undefined if authentication fails.
   */
  const authenticate = useCallback(
    async (clientId: string): Promise<{ token: string } | undefined> => {
      if (isProcessing) return
      setIsProcessing(true)

      try {
        const { token } = await authenticateClient(clientId)
        const { id, nickname } = await getCurrentPlayer(token)

        const clientInfo = { clientId, token, player: { id, nickname } }
        setClientId(clientId)
        setToken(token)
        setPlayer({ id, nickname })
        saveClientInfoToStorage(clientInfo)

        return { token }
      } catch (error) {
        console.error('Authentication failed:', error)
        return undefined
      } finally {
        setIsProcessing(false)
      }
    },
    [authenticateClient, getCurrentPlayer, isProcessing],
  )

  /**
   * Initialize the client state from localStorage or generate a new client.
   */
  useEffect(() => {
    if (isProcessing || (clientId && token)) return

    const storedInfo = loadClientInfoFromStorage()
    if (storedInfo) {
      setClientId(storedInfo.clientId)
      setToken(storedInfo.token)
      setPlayer(storedInfo.player)
    } else {
      authenticate(uuidv4()).then()
    }
  }, [clientId, token, isProcessing, authenticate])

  return (
    <ClientContext.Provider
      value={{
        clientId,
        token,
        player,
        authenticate: () =>
          clientId ? authenticate(clientId) : authenticate(uuidv4()),
      }}>
      {children}
    </ClientContext.Provider>
  )
}

export default ClientContextProvider
