import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AdminRoute } from '../features/auth/AdminRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { UsersPage } from '../pages/UsersPage';
import { CustomersPage } from '../pages/CustomersPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { BeneficiariesPage } from '../pages/BeneficiariesPage';
import { TransfersPage } from '../pages/TransfersPage';
import { AuditPage } from '../pages/AuditPage';
import { FraudAlertsPage } from '../pages/FraudAlertsPage';
import { LedgerPage } from '../pages/LedgerPage';
import { ProfilePage } from '../pages/ProfilePage';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          { path: 'accounts', element: <AccountsPage /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: 'transfers', element: <TransfersPage /> },
          { path: 'ledger', element: <LedgerPage /> },
          { path: 'profile', element: <ProfilePage /> },
          {
            element: <AdminRoute />,
            children: [
              {
                path: 'users',
                element: <UsersPage />,
              },
              { path: 'customers', element: <CustomersPage /> },
              { path: 'beneficiaries', element: <BeneficiariesPage /> },
              { path: 'audit', element: <AuditPage /> },
              { path: 'fraud-alerts', element: <FraudAlertsPage /> },
            ],
          },
        ],
      },
      {
        path: 'status',
        element: <HomePage />,
      },
    ],
  },
]);
