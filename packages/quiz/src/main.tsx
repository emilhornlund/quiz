import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Bounce, ToastContainer } from 'react-toastify'

import AuthContextProvider from './context/auth'
import GameContextProvider from './context/game'
import {
  DiscoverPage,
  ErrorPage,
  GameHistoryPage,
  GamePage,
  GameResultsPage,
  HomePage,
  JoinPage,
  PlayerLinkPage,
  ProfilePage,
  QuizCreatorPage,
  QuizDetailsPage,
  QuizzesPage,
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
        path: '/discover',
        element: <DiscoverPage />,
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
        path: '/game/history',
        element: <GameHistoryPage />,
      },
      {
        path: '/game/results/:gameID',
        element: <GameResultsPage />,
      },
      {
        path: '/player/profile',
        element: <ProfilePage />,
      },
      {
        path: '/player/quizzes',
        element: <QuizzesPage />,
      },
      {
        path: '/player/link',
        element: <PlayerLinkPage />,
      },
      {
        path: '/quiz/create',
        element: <QuizCreatorPage />,
      },
      {
        path: '/quiz/details/:quizId',
        element: <QuizDetailsPage />,
      },
      {
        path: '/quiz/details/:quizId/edit',
        element: <QuizCreatorPage />,
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
