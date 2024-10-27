import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Bounce, ToastContainer } from 'react-toastify'

import {
  CreateGamePage,
  ErrorPage,
  GamePage,
  HomePage,
  JoinPage,
} from './pages'
import { GameProvider } from './pages/GamePage'

import './styles/fonts.scss'
import './styles/index.css'

import 'react-toastify/dist/ReactToastify.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      {
        path: '/',
        index: true,
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
        element: (
          <GameProvider>
            <GamePage />
          </GameProvider>
        ),
      },
    ],
    errorElement: <ErrorPage />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition={Bounce}
    />
  </StrictMode>,
)
