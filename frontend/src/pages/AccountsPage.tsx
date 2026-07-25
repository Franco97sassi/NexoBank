import { useState } from 'react';
import { Add, EditOutlined, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  IconButton,
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
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { AccountDialog } from '../features/accounts/AccountDialog';
import { createAccount, getAccounts, updateAccount } from '../features/accounts/accountsApi';
import type {
  Account,
  AccountQuery,
  CreateAccountData,
  UpdateAccountData,
} from '../features/accounts/accountTypes';

const accountTypeLabel = { SAVINGS: 'Caja de ahorro', CHECKING: 'Cuenta corriente' };
const statusLabel = { ACTIVE: 'Activa', BLOCKED: 'Bloqueada', CLOSED: 'Cerrada' };

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? 'No se pudo completar la operación.')
    : 'No se pudo completar la operación.';
}

export function AccountsPage() {
  const client = useQueryClient();
  const [query, setQuery] = useState<AccountQuery>({
    search: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    direction: 'DESC',
  });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Account | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const accounts = useQuery({
    queryKey: ['accounts', query],
    queryFn: () => getAccounts(query),
  });
  const save = useMutation({
    mutationFn: (data: CreateAccountData | UpdateAccountData) =>
      editing
        ? updateAccount(editing.id, data as UpdateAccountData)
        : createAccount(data as CreateAccountData),
    onSuccess: async () => {
      setDialogOpen(false);
      setMessage(editing ? 'Cuenta actualizada.' : 'Cuenta creada.');
      await client.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
  const sort = (sortBy: AccountQuery['sortBy']) =>
    setQuery((current) => ({
      ...current,
      page: 0,
      sortBy,
      direction:
        current.sortBy === sortBy && current.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  const sortable = (field: AccountQuery['sortBy'], label: string) => (
    <TableSortLabel
      active={query.sortBy === field}
      direction={query.direction.toLowerCase() as 'asc' | 'desc'}
      onClick={() => sort(field)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Gestión de cuentas</Typography>
        <Typography color="text.secondary">
          Crea cuentas bancarias y administra sus alias y estados.
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Buscar por titular, documento, CBU o alias"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) =>
              event.key === 'Enter' && setQuery((value) => ({ ...value, search, page: 0 }))
            }
            size="small"
            value={search}
          />
          <Button
            onClick={() => setQuery((value) => ({ ...value, search, page: 0 }))}
            startIcon={<Search />}
            variant="outlined"
          >
            Buscar
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
              save.reset();
            }}
            startIcon={<Add />}
            variant="contained"
          >
            Nueva cuenta
          </Button>
        </Stack>
      </Paper>
      {accounts.isError && <Alert severity="error">{errorMessage(accounts.error)}</Alert>}
      {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
      <TableContainer component={Paper}>
        <Table aria-label="Cuentas">
          <TableHead>
            <TableRow>
              <TableCell>Titular</TableCell>
              <TableCell>{sortable('cbu', 'CBU')}</TableCell>
              <TableCell>{sortable('alias', 'Alias')}</TableCell>
              <TableCell>{sortable('accountType', 'Tipo')}</TableCell>
              <TableCell>{sortable('currency', 'Moneda')}</TableCell>
              <TableCell align="right">{sortable('balance', 'Saldo')}</TableCell>
              <TableCell>{sortable('status', 'Estado')}</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.isLoading && (
              <TableRow><TableCell colSpan={8}>Cargando cuentas…</TableCell></TableRow>
            )}
            {accounts.data?.content.map((account) => (
              <TableRow hover key={account.id}>
                <TableCell>
                  {account.customerName}
                  <Typography color="text.secondary" display="block" variant="caption">
                    {account.customerDocument}
                  </Typography>
                </TableCell>
                <TableCell>{account.cbu}</TableCell>
                <TableCell>{account.alias}</TableCell>
                <TableCell>{accountTypeLabel[account.accountType]}</TableCell>
                <TableCell>{account.currency}</TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: account.currency,
                  }).format(account.balance)}
                </TableCell>
                <TableCell>{statusLabel[account.status]}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => {
                        setEditing(account);
                        setDialogOpen(true);
                        save.reset();
                      }}
                    >
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!accounts.isLoading && accounts.data?.content.length === 0 && (
              <TableRow><TableCell align="center" colSpan={8}>No se encontraron cuentas.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={accounts.data?.totalElements ?? 0}
          onPageChange={(_, page) => setQuery((value) => ({ ...value, page }))}
          onRowsPerPageChange={(event) =>
            setQuery((value) => ({ ...value, page: 0, size: Number(event.target.value) }))
          }
          page={query.page}
          rowsPerPage={query.size}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
      <AccountDialog
        account={editing}
        loading={save.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={(data) => save.mutate(data)}
        open={dialogOpen}
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
