import { lazy, Suspense, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AdminRoute } from '../features/auth/AdminRoute';
import { AppLayout } from '../components/layout/AppLayout';

const pages = {
  Dashboard: lazy(() =>
    import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
  ),
  Home: lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage }))),
  Login: lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage }))),
  Register: lazy(() =>
    import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
  ),
  Users: lazy(() => import('../pages/UsersPage').then((m) => ({ default: m.UsersPage }))),
  Customers: lazy(() =>
    import('../pages/CustomersPage').then((m) => ({ default: m.CustomersPage })),
  ),
  Accounts: lazy(() =>
    import('../pages/AccountsPage').then((m) => ({ default: m.AccountsPage })),
  ),
  Transactions: lazy(() =>
    import('../pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })),
  ),
  Beneficiaries: lazy(() =>
    import('../pages/BeneficiariesPage').then((m) => ({ default: m.BeneficiariesPage })),
  ),
  Transfers: lazy(() =>
    import('../pages/TransfersPage').then((m) => ({ default: m.TransfersPage })),
  ),
  Audit: lazy(() => import('../pages/AuditPage').then((m) => ({ default: m.AuditPage }))),
  FraudAlerts: lazy(() =>
    import('../pages/FraudAlertsPage').then((m) => ({ default: m.FraudAlertsPage })),
  ),
  Ledger: lazy(() =>
    import('../pages/LedgerPage').then((m) => ({ default: m.LedgerPage })),
  ),
  Profile: lazy(() =>
    import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
  ),
};

function lazyPage(page: ReactNode) {
  return (
    <Suspense
      fallback={
        <Box alignItems="center" display="flex" justifyContent="center" minHeight="40vh">
          <CircularProgress aria-label="Cargando página" />
        </Box>
      }
    >
      {page}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'login',
        element: lazyPage(<pages.Login />),
      },
      {
        path: 'register',
        element: lazyPage(<pages.Register />),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: lazyPage(<pages.Dashboard />),
          },
          { path: 'accounts', element: lazyPage(<pages.Accounts />) },
          { path: 'transactions', element: lazyPage(<pages.Transactions />) },
          { path: 'transfers', element: lazyPage(<pages.Transfers />) },
          { path: 'ledger', element: lazyPage(<pages.Ledger />) },
          { path: 'profile', element: lazyPage(<pages.Profile />) },
          {
            element: <AdminRoute />,
            children: [
              {
                path: 'users',
                element: lazyPage(<pages.Users />),
              },
              { path: 'customers', element: lazyPage(<pages.Customers />) },
              { path: 'beneficiaries', element: lazyPage(<pages.Beneficiaries />) },
              { path: 'audit', element: lazyPage(<pages.Audit />) },
              { path: 'fraud-alerts', element: lazyPage(<pages.FraudAlerts />) },
            ],
          },
        ],
      },
      {
        path: 'status',
        element: lazyPage(<pages.Home />),
      },
    ],
  },
]);
