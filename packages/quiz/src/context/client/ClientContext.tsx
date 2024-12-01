import { createContext } from 'react'

export type ClientContextInfo = {
  clientId?: string
  token?: string
  player?: {
    id: string
    nickname: string
  }
  authenticate: () => Promise<{ token: string } | undefined>
}

export const ClientContext = createContext<ClientContextInfo>({
  authenticate: () => Promise.reject(),
})
