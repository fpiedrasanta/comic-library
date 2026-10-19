import { type RouteObject } from 'react-router-dom'
import ProtectedRoute from './protected-route'
import RootRedirect from './root-redirect'
import LoginPage from '@/pages/login-page'
import RegisterPage from '@/pages/register-page'
import VerifyEmailPage from '@/pages/verify-email-page'
import ForgotPasswordPage from '@/pages/forgot-password-page'
import VerifyRecoveryCodePage from '@/pages/verify-recovery-code-page'
import ResetPasswordPage from '@/pages/reset-password-page'
import IndexPage from '@/pages/index-page'
import ProfilePage from '@/pages/profile-page'
import SettingsPage from '@/pages/settings-page'
import {
  CatalogRoutePage,
  PublisherRoutePage,
  FranchiseRoutePage,
  SeriesRoutePage,
  PublishersPage,
  FranchisesPage,
  SeriesPage,
  ListsPage,
  ListRoutePage,
  MyCollectionPage,
  FavoritesPage,
  WorkRoutePage,
} from '@/features/catalog/pages'

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/verify-recovery-code',
    element: <VerifyRecoveryCodePage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
]

export const protectedRoutes: RouteObject[] = [
  {
    path: '/index',
    element: (
      <ProtectedRoute>
        <IndexPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/catalog',
    element: (
      <ProtectedRoute>
        <CatalogRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/publishers',
    element: (
      <ProtectedRoute>
        <PublishersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/franchises',
    element: (
      <ProtectedRoute>
        <FranchisesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/series',
    element: (
      <ProtectedRoute>
        <SeriesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lists',
    element: (
      <ProtectedRoute>
        <ListsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/publishers/:id',
    element: (
      <ProtectedRoute>
        <PublisherRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/franchises/:id',
    element: (
      <ProtectedRoute>
        <FranchiseRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/series/:id',
    element: (
      <ProtectedRoute>
        <SeriesRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lists/:id',
    element: (
      <ProtectedRoute>
        <ListRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-collection',
    element: (
      <ProtectedRoute>
        <MyCollectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/favorites',
    element: (
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/works/:id',
    element: (
      <ProtectedRoute>
        <WorkRoutePage />
      </ProtectedRoute>
    ),
  },
]
