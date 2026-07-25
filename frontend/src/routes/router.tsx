import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AdminRoute } from '../features/auth/AdminRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { UsersPage } from '../pages/UsersPage';
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
           {
            element: <AdminRoute />,
            children: [
              {
                path: 'users',
                element: <UsersPage />,
              },
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
