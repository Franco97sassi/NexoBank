import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
export function AppLayout() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
            <Outlet />
    </Container>
  );
}