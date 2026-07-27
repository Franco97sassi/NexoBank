import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFraudAlerts, reviewFraudAlert } from '../features/fraud/fraudApi';
import type { FraudAlertSeverity, FraudAlertStatus } from '../features/fraud/fraudTypes';

const statusLabels: Record<FraudAlertStatus, string> = {
  OPEN: 'Abierta',
  UNDER_REVIEW: 'En revisión',
  DISMISSED: 'Descartada',
  CONFIRMED: 'Confirmada',
};
const severityColors: Record<FraudAlertSeverity, 'default' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
};

export function FraudAlertsPage() {
  const client = useQueryClient();
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const alerts = useQuery({
    queryKey: ['fraud-alerts', status, severity, page, size],
    queryFn: () => getFraudAlerts(status, severity, page, size),
  });
  const review = useMutation({
    mutationFn: ({ id, next }: { id: string; next: FraudAlertStatus }) =>
      reviewFraudAlert(id, next),
    onSuccess: () => client.invalidateQueries({ queryKey: ['fraud-alerts'] }),
  });
  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Alertas de fraude
        </Typography>
        <Typography color="text.secondary">
          Supervisa transferencias inusuales y documenta su revisión.
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Estado"
            size="small"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Severidad"
            size="small"
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>
      {(alerts.isError || review.isError) && (
        <Alert severity="error">No se pudo completar la operación.</Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Regla</TableCell>
              <TableCell>Severidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Detalle</TableCell>
              <TableCell>Revisión</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.isLoading && (
              <TableRow>
                <TableCell colSpan={6}>Cargando alertas…</TableCell>
              </TableRow>
            )}
            {alerts.data?.content.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{new Date(item.createdAt).toLocaleString('es-AR')}</TableCell>
                <TableCell>{item.ruleCode}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={severityColors[item.severity]}
                    label={item.severity}
                  />
                </TableCell>
                <TableCell>{statusLabels[item.status]}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {item.status === 'OPEN' && (
                      <Button
                        size="small"
                        onClick={() =>
                          review.mutate({ id: item.id, next: 'UNDER_REVIEW' })
                        }
                      >
                        Revisar
                      </Button>
                    )}
                    {item.status === 'UNDER_REVIEW' && (
                      <>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            review.mutate({ id: item.id, next: 'CONFIRMED' })
                          }
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            review.mutate({ id: item.id, next: 'DISMISSED' })
                          }
                        >
                          Descartar
                        </Button>
                      </>
                    )}
                    {item.reviewedBy && (
                      <Typography variant="caption">{item.reviewedBy}</Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!alerts.isLoading && alerts.data?.content.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay alertas con estos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={alerts.data?.totalElements ?? 0}
          page={page}
          rowsPerPage={size}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, value) => setPage(value)}
          onRowsPerPageChange={(e) => {
            setSize(Number(e.target.value));
            setPage(0);
          }}
        />
      </TableContainer>
    </Stack>
  );
}
