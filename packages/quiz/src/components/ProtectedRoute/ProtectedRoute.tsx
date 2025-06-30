import React, { FC } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthContext } from '../../context/auth'

export interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const auth = useAuthContext()

  if (!auth.isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
