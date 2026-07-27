import { useState } from 'react';
import { Add, ReceiptLong, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAccounts } from '../features/accounts/accountsApi';
import { getBeneficiaries } from '../features/beneficiaries/beneficiariesApi';
import { TransferDialog } from '../features/transfers/TransferDialog';
import { TransferReceiptDialog } from '../features/transfers/TransferReceiptDialog';
import {
  createTransfer,
  getTransferReceipt,
  getTransfers,
} from '../features/transfers/transfersApi';
import type {
  CreateTransferData,
  TransferQuery,
  TransferStatus,
} from '../features/transfers/transferTypes';

const statuses: TransferStatus[] = [
  'PENDING',
  'COMPLETED',
  'REJECTED',
  'FAILED',
  'CANCELLED',
];
const labels: Record<TransferStatus, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  REJECTED: 'Rechazada',
  FAILED: 'Fallida',
  CANCELLED: 'Cancelada',
};
const errorMessage = (error: unknown) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? 'No se pudo completar la operación.')
    : 'No se pudo completar la operación.';

export function TransfersPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<TransferQuery>({
    accountId: '',
    status: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    direction: 'DESC',
  });
  const [accountFilter, setAccountFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [receiptTransferId, setReceiptTransferId] = useState('');
  const transfers = useQuery({
    queryKey: ['transfers', query],
    queryFn: () => getTransfers(query),
  });
  const accounts = useQuery({
    queryKey: ['accounts', 'transfer-options'],
    queryFn: () =>
      getAccounts({ search: '', page: 0, size: 100, sortBy: 'alias', direction: 'ASC' }),
  });
  const beneficiaries = useQuery({
    queryKey: ['beneficiaries', 'transfer-options'],
    queryFn: () =>
      getBeneficiaries({
        customerId: '',
        search: '',
        active: true,
        page: 0,
        size: 100,
        sortBy: 'displayName',
        direction: 'ASC',
      }),
  });
  const receipt = useQuery({
    queryKey: ['transfer-receipt', receiptTransferId],
    queryFn: () => getTransferReceipt(receiptTransferId),
    enabled: Boolean(receiptTransferId),
  });
  const save = useMutation({
    mutationFn: (data: CreateTransferData) => createTransfer(data),
    onSuccess: async () => {
      setOpen(false);
      setMessage('Transferencia realizada correctamente.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transfers'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ]);
    },
  });
  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Transferencias
        </Typography>
        <Typography color="text.secondary">
          Envía fondos de forma segura y consulta el historial.
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Cuenta de origen"
            select
            size="small"
            value={accountFilter}
            onChange={(event) => setAccountFilter(event.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {accounts.data?.content.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.alias} · {account.cbu}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Estado"
            select
            size="small"
            value={query.status}
            onChange={(event) =>
              setQuery((value) => ({
                ...value,
                status: event.target.value as TransferQuery['status'],
                page: 0,
              }))
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {labels[status]}
              </MenuItem>
            ))}
          </TextField>
          <Button
            startIcon={<Search />}
            variant="outlined"
            onClick={() =>
              setQuery((value) => ({ ...value, accountId: accountFilter, page: 0 }))
            }
          >
            Filtrar
          </Button>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => {
              save.reset();
              setOpen(true);
            }}
          >
            Nueva
          </Button>
        </Stack>
      </Paper>
      {(transfers.isError || save.isError) && (
        <Alert severity="error">{errorMessage(transfers.error ?? save.error)}</Alert>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="Transferencias">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destinatario</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell align="right">Importe</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell align="center">Comprobante</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.isLoading && (
              <TableRow>
                <TableCell colSpan={8}>Cargando transferencias…</TableCell>
              </TableRow>
            )}
            {transfers.data?.content.map((transfer) => (
              <TableRow hover key={transfer.id}>
                <TableCell>
                  {new Date(transfer.createdAt).toLocaleString('es-AR')}
                </TableCell>
                <TableCell>{transfer.sourceCbu}</TableCell>
                <TableCell>{transfer.beneficiaryName}</TableCell>
                <TableCell>
                  {transfer.destinationAlias ?? transfer.destinationCbu}
                </TableCell>
                <TableCell align="right">
                  {transfer.currency}{' '}
                  {transfer.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{labels[transfer.status]}</TableCell>
                <TableCell>{transfer.description || '—'}</TableCell>
                <TableCell align="center">
                  <Tooltip
                    title={
                      transfer.status === 'COMPLETED'
                        ? 'Ver comprobante'
                        : 'Disponible al completarse'
                    }
                  >
                    <span>
                      <IconButton
                        aria-label="Ver comprobante"
                        disabled={transfer.status !== 'COMPLETED'}
                        onClick={() => setReceiptTransferId(transfer.id)}
                        size="small"
                      >
                        <ReceiptLong />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!transfers.isLoading && transfers.data?.content.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={8}>
                  No se encontraron transferencias.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={transfers.data?.totalElements ?? 0}
          page={query.page}
          rowsPerPage={query.size}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, page) => setQuery((value) => ({ ...value, page }))}
          onRowsPerPageChange={(event) =>
            setQuery((value) => ({ ...value, page: 0, size: Number(event.target.value) }))
          }
        />
      </TableContainer>
      <TransferDialog
        accounts={accounts.data?.content ?? []}
        beneficiaries={beneficiaries.data?.content ?? []}
        loading={save.isPending}
        onClose={() => setOpen(false)}
        onSubmit={(data) => save.mutate(data)}
        open={open}
      />
      <TransferReceiptDialog
        loading={receipt.isLoading}
        onClose={() => setReceiptTransferId('')}
        open={Boolean(receiptTransferId)}
        receipt={receipt.data}
      />
      <Snackbar
        autoHideDuration={3500}
        message={message}
        onClose={() => setMessage('')}
        open={Boolean(message)}
      />
    </Stack>
  );
}
