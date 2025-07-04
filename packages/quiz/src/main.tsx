import { TokenScope } from '@quiz/common'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Bounce, ToastContainer } from 'react-toastify'

import { ProtectedRoute } from './components'
import AuthContextProvider from './context/auth'
import GameContextProvider from './context/game'
import {
  AuthGamePage,
  CreateUserPage,
  DiscoverPage,
  ErrorPage,
  GamePage,
  GameResultsPage,
  HomePage,
  JoinPage,
  LoginPage,
  ProfileGamesPage,
  ProfileQuizzesPage,
  ProfileUserPage,
  QuizCreatorPage,
  QuizDetailsPage,
} from './pages'

import './styles/fonts.scss'
import './styles/index.css'

import 'react-toastify/dist/ReactToastify.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthContextProvider>
        <Outlet />
      </AuthContextProvider>
    ),
    children: [
      {
        path: '/',
        index: true,
        element: <HomePage />,
      },
      {
        path: '/auth/login',
        element: (
          <ProtectedRoute authenticated={false}>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/auth/register',
        element: (
          <ProtectedRoute authenticated={false}>
            <CreateUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/auth/game',
        element: <AuthGamePage />,
      },
      {
        path: '/discover',
        element: (
          <ProtectedRoute>
            <DiscoverPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/join',
        element: (
          <ProtectedRoute scope={TokenScope.Game}>
            <GameContextProvider>
              <JoinPage />
            </GameContextProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: '/game',
        element: (
          <ProtectedRoute scope={TokenScope.Game}>
            <GameContextProvider>
              <GamePage />
            </GameContextProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: '/game/results/:gameID',
        element: (
          <ProtectedRoute>
            <GameResultsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/user',
        element: (
          <ProtectedRoute>
            <ProfileUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/quizzes',
        element: (
          <ProtectedRoute>
            <ProfileQuizzesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/games',
        element: (
          <ProtectedRoute>
            <ProfileGamesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/quiz/create',
        element: (
          <ProtectedRoute>
            <QuizCreatorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/quiz/details/:quizId',
        element: (
          <ProtectedRoute>
            <QuizDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/quiz/details/:quizId/edit',
        element: (
          <ProtectedRoute>
            <QuizCreatorPage />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <ErrorPage />,
  },
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
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
