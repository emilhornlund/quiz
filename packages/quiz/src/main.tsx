import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Bounce, ToastContainer } from 'react-toastify'

import { ProtectedRoute } from './components'
import AuthContextProvider from './context/auth'
import GameContextProvider from './context/game'
import {
  CreateUserPage,
  DiscoverPage,
  ErrorPage,
  GamePage,
  GameResultsPage,
  HomePage,
  JoinPage,
  LoginPage,
  ProfileGamesPage,
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
        path: '/auth/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/register',
        element: <CreateUserPage />,
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
          <GameContextProvider>
            <JoinPage />
          </GameContextProvider>
        ),
      },
      {
        path: '/game',
        element: (
          <ProtectedRoute>
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
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/quizzes',
        element: (
          <ProtectedRoute>
            <QuizzesPage />
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
