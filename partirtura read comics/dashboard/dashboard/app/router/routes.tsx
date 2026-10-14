import { type RouteObject } from 'react-router-dom'
import LoginPage from '@/pages/login-page'
import ForgotPasswordPage from '@/pages/forgot-password-page'
import VerifyRecoveryCodePage from '@/pages/verify-recovery-code-page'
import ResetPasswordPage from '@/pages/reset-password-page'
import SettingsPage from '@/pages/settings-page'
import UsersPage from '@/pages/users-page'
import AdminsPage from '@/pages/admins-page'
import AdminFormPage from '@/pages/admin-form-page'
import CountriesPage from '@/pages/countries-page'
import PublishersPage from '@/pages/publishers-page'
import PublisherFormPage from '@/pages/publisher-form-page'
import PersonsPage from '@/features/people/pages/persons-page'
import FranchisesPage from '@/pages/franchises-page'
import FranchiseSelectPublisherPage from '@/pages/franchise-select-publisher-page'
import FranchiseFormPage from '@/pages/franchise-form-page'
import FranchiseWorksPage from '@/features/works/pages/franchise-works-page'
import SeriesWorksPage from '@/features/works/pages/series-works-page'
import PublisherWorksPage from '@/features/works/pages/publisher-works-page'
import SeriesPage from '@/pages/series-page'
import SeriesSelectFranchisePage from '@/pages/series-select-franchise-page'
import SeriesFormPage from '@/pages/series-form-page'
import WorksPage from '@/pages/works-page'
import WorkFormPage from '@/features/works/pages/work-form-page'
import BansPage from '@/pages/bans-page'
import BansSelectUserPage from '@/pages/bans-select-user-page'
import BanFormPage from '@/pages/ban-form-page'
import DashboardLayout from '@/pages/dashboard-layout'
import HomePage from '@/pages/home-page'
import RolesPage from '@/features/roles/pages/roles-page'
import TagsPage from '@/features/tags/pages/tags-page'
import ListTypesPage from '@/features/list-types/pages/list-types-page'
import WorkListsPage from '@/features/work-lists/pages/work-lists-page'
import WorkListFormPage from '@/features/work-lists/pages/work-list-form-page'
import ProtectedRoute from './protected-route'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
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
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'admins',
        element: <AdminsPage />,
      },
      {
        path: 'admins/create',
        element: <AdminFormPage />,
      },
      {
        path: 'admins/:id/edit',
        element: <AdminFormPage />,
      },
      {
        path: 'countries',
        element: <CountriesPage />,
      },
      {
        path: 'publishers',
        element: <PublishersPage />,
      },
      {
        path: 'publishers/create',
        element: <PublisherFormPage />,
      },
      {
        path: 'publishers/:id/edit',
        element: <PublisherFormPage />,
      },
      {
        path: 'persons',
        element: <PersonsPage />,
      },
      {
        path: 'roles',
        element: <RolesPage />,
      },
      {
        path: 'tags',
        element: <TagsPage />,
      },
      {
        path: 'list-types',
        element: <ListTypesPage />,
      },
      {
        path: 'work-lists',
        element: <WorkListsPage />,
      },
      {
        path: 'work-lists/create',
        element: <WorkListFormPage />,
      },
      {
        path: 'work-lists/:id/edit',
        element: <WorkListFormPage />,
      },
      {
        path: 'franchises',
        element: <FranchisesPage />,
      },
      {
        path: 'franchises/select-publisher',
        element: <FranchiseSelectPublisherPage />,
      },
      {
        path: 'franchises/create',
        element: <FranchiseFormPage />,
      },
      {
        path: 'franchises/:id/edit',
        element: <FranchiseFormPage />,
      },
      {
        path: 'franchises/:franchiseId/works',
        element: <FranchiseWorksPage />,
      },
      {
        path: 'franchises/:franchiseId/works/create',
        element: <WorkFormPage />,
      },
      {
        path: 'franchises/:franchiseId/works/:workId/edit',
        element: <WorkFormPage />,
      },
      {
        path: 'series',
        element: <SeriesPage />,
      },
      {
        path: 'series/select-franchise',
        element: <SeriesSelectFranchisePage />,
      },
      {
        path: 'series/create',
        element: <SeriesFormPage />,
      },
      {
        path: 'series/:id/edit',
        element: <SeriesFormPage />,
      },
      {
        path: 'series/:seriesId/works',
        element: <SeriesWorksPage />,
      },
      {
        path: 'series/:seriesId/works/create',
        element: <WorkFormPage />,
      },
      {
        path: 'series/:seriesId/works/:workId/edit',
        element: <WorkFormPage />,
      },
      {
        path: 'publishers/:publisherId/works',
        element: <PublisherWorksPage />,
      },
      {
        path: 'publishers/:publisherId/works/create',
        element: <WorkFormPage />,
      },
      {
        path: 'publishers/:publisherId/works/:workId/edit',
        element: <WorkFormPage />,
      },
      {
        path: 'works',
        element: <WorksPage />,
      },
      {
        path: 'works/create',
        element: <WorkFormPage />,
      },
      {
        path: 'works/:workId/edit',
        element: <WorkFormPage />,
      },
      {
        path: 'numbers',
        element: <WorksPage />,
      },
      {
        path: 'bans',
        element: <BansPage />,
      },
      {
        path: 'bans/select-user',
        element: <BansSelectUserPage />,
      },
      {
        path: 'bans/create',
        element: <BanFormPage />,
      },
      {
        path: 'bans/:id/edit',
        element: <BanFormPage />,
      },
    ],
  },
]
