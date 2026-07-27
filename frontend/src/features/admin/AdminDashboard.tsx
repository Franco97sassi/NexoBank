import { useQuery } from '@tanstack/react-query';
import {
  AccountBalanceWallet,
  ManageAccounts,
  People,
  ReceiptLong,
  SwapHoriz,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from './adminApi';

const number = new Intl.NumberFormat('es-AR');
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const statusLabels = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  REJECTED: 'Rechazada',
  FAILED: 'Fallida',
  CANCELLED: 'Cancelada',
};

type KpiProps = { label: string; value: string; detail: string };
function Kpi({ label, value, detail }: KpiProps) {
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography component="p" sx={{ my: 0.75 }} variant="h4">
            {value}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {detail}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export function AdminDashboard() {
  const dashboard = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
  });

  if (dashboard.isLoading) {
    return (
      <Box sx={{ display: 'grid', minHeight: 320, placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (dashboard.isError || !dashboard.data) {
    return <Alert severity="error">No se pudo cargar el panel administrativo.</Alert>;
  }
  const data = dashboard.data;
  const completedPercent = data.transfers
    ? (data.completedTransfers / data.transfers) * 100
    : 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Panel administrativo
        </Typography>
        <Typography color="text.secondary">
          Indicadores operativos y accesos de gestión de NexoBank.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Kpi
          label="Clientes"
          value={number.format(data.customers)}
          detail={`${number.format(data.users)} usuarios registrados`}
        />
        <Kpi
          label="Cuentas activas"
          value={number.format(data.activeAccounts)}
          detail={`${number.format(data.blockedAccounts)} bloqueadas de ${number.format(data.accounts)}`}
        />
        <Kpi
          label="Saldo administrado"
          value={money.format(data.totalActiveBalance)}
          detail="Saldo total en cuentas activas"
        />
        <Kpi
          label="Volumen transferido"
          value={money.format(data.completedTransferVolume)}
          detail={`${number.format(data.completedTransfers)} transferencias completadas`}
        />
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ height: '100%', p: 3 }}>
            <Typography gutterBottom variant="h6">
              Resumen operativo
            </Typography>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Transferencias completadas</Typography>
                  <Typography variant="body2">{completedPercent.toFixed(1)}%</Typography>
                </Stack>
                <LinearProgress
                  sx={{ mt: 1 }}
                  value={completedPercent}
                  variant="determinate"
                />
              </Box>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Transferencias totales</Typography>
                <strong>{number.format(data.transfers)}</strong>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Transferencias rechazadas</Typography>
                <strong>{number.format(data.rejectedTransfers)}</strong>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Movimientos registrados</Typography>
                <strong>{number.format(data.transactions)}</strong>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ height: '100%', p: 3 }}>
            <Typography gutterBottom variant="h6">
              Gestión rápida
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  fullWidth
                  component={Link}
                  startIcon={<ManageAccounts />}
                  to="/users"
                  variant="outlined"
                >
                  Gestionar usuarios
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  fullWidth
                  component={Link}
                  startIcon={<People />}
                  to="/customers"
                  variant="outlined"
                >
                  Gestionar clientes
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  fullWidth
                  component={Link}
                  startIcon={<AccountBalanceWallet />}
                  to="/accounts"
                  variant="outlined"
                >
                  Gestionar cuentas
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  fullWidth
                  component={Link}
                  startIcon={<ReceiptLong />}
                  to="/transactions"
                  variant="outlined"
                >
                  Ver movimientos
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  component={Link}
                  startIcon={<SwapHoriz />}
                  to="/transfers"
                  variant="contained"
                >
                  Consultar transferencias
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box>
        <Typography gutterBottom variant="h6">
          Transferencias recientes
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="Transferencias recientes">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Importe</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentTransfers.map((transfer) => (
                <TableRow hover key={transfer.id}>
                  <TableCell>
                    {new Date(transfer.createdAt).toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell>{transfer.sourceCbu}</TableCell>
                  <TableCell>{transfer.destinationCbu}</TableCell>
                  <TableCell>
                    <Chip
                      color={
                        transfer.status === 'COMPLETED'
                          ? 'success'
                          : transfer.status === 'REJECTED'
                            ? 'error'
                            : 'default'
                      }
                      label={statusLabels[transfer.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: transfer.currency,
                    }).format(transfer.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {!data.recentTransfers.length && (
                <TableRow>
                  <TableCell align="center" colSpan={5}>
                    Todavía no hay transferencias.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
