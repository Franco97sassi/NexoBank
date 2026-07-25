import { Alert } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './AuthContext';

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }
  if (user?.role !== 'ADMIN') {
    return <Alert severity="error">No tienes permisos para administrar usuarios.</Alert>;
  }
  return <Outlet />;
}
