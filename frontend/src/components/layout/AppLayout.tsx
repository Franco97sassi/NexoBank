import {
  AccountBalance,
  AccountBalanceWallet,
  ManageAccounts,
  People,
  ReceiptLong,
  PersonAddAlt,
  SwapHoriz,
  FactCheck,
  Policy,
} from '@mui/icons-material';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
export function AppLayout() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Box>
      {isAuthenticated && (
        <AppBar elevation={0} position="static">
          <Toolbar>
            <AccountBalance sx={{ mr: 1 }} />
            <Typography
              component={Link}
              sx={{ color: 'inherit', flexGrow: 1, textDecoration: 'none' }}
              to="/"
              variant="h6"
            >
              NexoBank
            </Typography>
            {user?.role === 'ADMIN' && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<ManageAccounts />}
                  to="/users"
                >
                  Usuarios
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<People />}
                  to="/customers"
                >
                  Clientes
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<AccountBalanceWallet />}
                  to="/accounts"
                >
                  Cuentas
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<ReceiptLong />}
                  to="/transactions"
                >
                  Movimientos
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<PersonAddAlt />}
                  to="/beneficiaries"
                >
                  Destinatarios
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<SwapHoriz />}
                  to="/transfers"
                >
                  Transferencias
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<FactCheck />}
                  to="/audit"
                >
                  Auditoría
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  startIcon={<Policy />}
                  to="/fraud-alerts"
                >
                  Fraude
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
