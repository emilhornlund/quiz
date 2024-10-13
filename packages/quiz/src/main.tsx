import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { CreateGamePage, GamePage, HomePage, JoinPage } from './pages'

import './styles/fonts.scss'
import './styles/index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/create',
    element: <CreateGamePage />,
  },
  {
    path: '/join',
    element: <JoinPage />,
  },
  {
    path: '/game',
    element: <GamePage />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
