import {
  AccountBalanceWallet,
  AddCard,
  ArrowDownward,
  ArrowUpward,
  SwapHoriz,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { AdminDashboard } from '../features/admin/AdminDashboard';
import { getAccounts } from '../features/accounts/accountsApi';
import { getTransactions } from '../features/transactions/transactionsApi';
import { useAuth } from '../features/auth/useAuth';

const outgoing = (type: string) => type === 'WITHDRAWAL' || type === 'TRANSFER_OUT';

export function DashboardPage() {
  const { user } = useAuth();
  const accounts = useQuery({
    queryKey: ['accounts', 'dashboard'],
    queryFn: () =>
      getAccounts({
        search: '',
        page: 0,
        size: 100,
        sortBy: 'balance',
        direction: 'DESC',
      }),
    enabled: user?.role !== 'ADMIN',
  });
  const transactions = useQuery({
    queryKey: ['transactions', 'dashboard'],
    queryFn: () =>
      getTransactions({
        accountId: '',
        type: '',
        from: '',
        to: '',
        page: 0,
        size: 5,
        sortBy: 'createdAt',
        direction: 'DESC',
      }),
    enabled: user?.role !== 'ADMIN',
  });

  if (user?.role === 'ADMIN') return <AdminDashboard />;

  const activeAccounts =
    accounts.data?.content.filter((account) => account.status === 'ACTIVE') ?? [];
  const balanceByCurrency = activeAccounts.reduce<Record<string, number>>(
    (totals, account) => {
      totals[account.currency] = (totals[account.currency] ?? 0) + account.balance;
      return totals;
    },
    {},
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Hola, {user?.email}
        </Typography>
        <Typography color="text.secondary">
          Tu dinero y actividad reciente, en un solo lugar.
        </Typography>
      </Box>
      {(accounts.isError || transactions.isError) && (
        <Alert severity="error">
          No pudimos cargar todo el resumen. Intenta nuevamente.
        </Alert>
      )}
      {accounts.isLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {Object.entries(balanceByCurrency).map(([currency, balance]) => (
            <Grid key={currency} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Saldo total en {currency}
                  </Typography>
                  <Typography sx={{ my: 1 }} variant="h4">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency,
                    }).format(balance)}
                  </Typography>
                  <Typography variant="caption">
                    {activeAccounts.filter((a) => a.currency === currency).length} cuentas
                    activas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Mis cuentas
                </Typography>
                <Typography sx={{ my: 1 }} variant="h4">
                  {activeAccounts.length}
                </Typography>
                <Button
                  component={Link}
                  startIcon={<AccountBalanceWallet />}
                  to="/accounts"
                >
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Typography variant="h6">Últimos movimientos</Typography>
              <Button component={Link} to="/transactions">
                Ver historial
              </Button>
            </Stack>
            <List disablePadding>
              {transactions.data?.content.map((transaction) => (
                <ListItem divider key={transaction.id}>
                  <ListItemIcon>
                    {outgoing(transaction.type) ? (
                      <ArrowUpward color="error" />
                    ) : (
                      <ArrowDownward color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={transaction.description || transaction.type}
                    secondary={`${transaction.accountAlias} · ${new Date(transaction.createdAt).toLocaleString('es-AR')}`}
                  />
                  <Typography
                    color={outgoing(transaction.type) ? 'error.main' : 'success.main'}
                    fontWeight={700}
                  >
                    {outgoing(transaction.type) ? '-' : '+'}
                    {transaction.amount.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </ListItem>
              ))}
              {!transactions.isLoading && !transactions.data?.content.length && (
                <ListItem>
                  <ListItemText primary="Todavía no hay movimientos." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography gutterBottom variant="h6">
              Accesos rápidos
            </Typography>
            <Stack spacing={1.5}>
              <Button
                component={Link}
                fullWidth
                startIcon={<SwapHoriz />}
                to="/transfers"
                variant="contained"
              >
                Nueva transferencia
              </Button>
              <Button
                component={Link}
                fullWidth
                startIcon={<AddCard />}
                to="/transactions"
                variant="outlined"
              >
                Registrar movimiento
              </Button>
              <Button
                component={Link}
                fullWidth
                startIcon={<AccountBalanceWallet />}
                to="/accounts"
                variant="outlined"
              >
                Consultar cuentas
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
