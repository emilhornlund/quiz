import { useContext } from 'react'

import { ClientContext } from './ClientContext.tsx'

export const useClientContext = () => useContext(ClientContext)
