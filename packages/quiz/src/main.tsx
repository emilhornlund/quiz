import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Bounce, ToastContainer } from 'react-toastify'

import AuthContextProvider from './context/auth'
import GameContextProvider from './context/game'
import {
  CreateQuizPage,
  EditQuizPage,
  ErrorPage,
  GamePage,
  HomePage,
  JoinPage,
  PlayerLinkPage,
  ProfilePage,
} from './pages'

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
        path: '/join',
        element: <JoinPage />,
      },
      {
        path: '/game',
        element: (
          <GameContextProvider>
            <GamePage />
          </GameContextProvider>
        ),
      },
      {
        path: '/player/profile',
        element: <ProfilePage />,
      },
      {
        path: '/player/link',
        element: <PlayerLinkPage />,
      },
      {
        path: '/quiz/create',
        element: <CreateQuizPage />,
      },
      {
        path: '/quiz/:quizId',
        element: <EditQuizPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </QueryClientProvider>
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
