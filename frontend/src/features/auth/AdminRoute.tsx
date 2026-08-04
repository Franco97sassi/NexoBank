import { Alert, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './useAuth';

export function AdminRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <CircularProgress aria-label="Restaurando sesión" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }
  if (user?.role !== 'ADMIN') {
    return <Alert severity="error">No tienes permisos para administrar usuarios.</Alert>;
  }
  return <Outlet />;
}
