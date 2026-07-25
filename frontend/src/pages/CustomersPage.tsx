import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Add, DeleteOutline, EditOutlined, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

import { CustomerDialog } from '../features/customers/CustomerDialog';
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../features/customers/customersApi';
import type {
  Customer,
  CustomerFormData,
  CustomerQuery,
} from '../features/customers/customerTypes';

function errorMessage(error: unknown) {
  return axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? 'No se pudo completar la operación.')
    : 'No se pudo completar la operación.';
}

export function CustomersPage() {
  const client = useQueryClient();
  const [query, setQuery] = useState<CustomerQuery>({
    search: '',
    page: 0,
    size: 10,
    sortBy: 'lastName',
    direction: 'ASC',
  });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [message, setMessage] = useState('');
  const customers = useQuery({
    queryKey: ['customers', query],
    queryFn: () => getCustomers(query),
  });
  const refresh = () => client.invalidateQueries({ queryKey: ['customers'] });
  const save = useMutation({
    mutationFn: (data: CustomerFormData) =>
      editing ? updateCustomer(editing.id, data) : createCustomer(data),
    onSuccess: async () => {
      setDialogOpen(false);
      setMessage(editing ? 'Cliente actualizado.' : 'Cliente creado.');
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: async () => {
      setDeleting(null);
      setMessage('Cliente eliminado.');
      await refresh();
    },
  });
  const sort = (sortBy: CustomerQuery['sortBy']) =>
    setQuery((current) => ({
      ...current,
      page: 0,
      sortBy,
      direction:
        current.sortBy === sortBy && current.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  const sortable = (field: CustomerQuery['sortBy'], label: string) => (
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
        <Typography component="h1" variant="h4">
          Gestión de clientes
        </Typography>
        <Typography color="text.secondary">
          Administra los datos personales y su relación con usuarios.
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Buscar por nombre, documento o correo"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && setQuery((q) => ({ ...q, search, page: 0 }))
            }
          />
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={() => setQuery((q) => ({ ...q, search, page: 0 }))}
          >
            Buscar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
              save.reset();
            }}
          >
            Nuevo cliente
          </Button>
        </Stack>
      </Paper>
      {customers.isError && (
        <Alert severity="error">{errorMessage(customers.error)}</Alert>
      )}
      {(save.isError || remove.isError) && (
        <Alert severity="error">{errorMessage(save.error ?? remove.error)}</Alert>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="Clientes">
          <TableHead>
            <TableRow>
              <TableCell>{sortable('lastName', 'Cliente')}</TableCell>
              <TableCell>{sortable('documentNumber', 'Documento')}</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>{sortable('birthDate', 'Nacimiento')}</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.isLoading && (
              <TableRow>
                <TableCell colSpan={6}>Cargando clientes…</TableCell>
              </TableRow>
            )}
            {customers.data?.content.map((customer) => (
              <TableRow hover key={customer.id}>
                <TableCell>
                  {customer.lastName}, {customer.firstName}
                </TableCell>
                <TableCell>{customer.documentNumber}</TableCell>
                <TableCell>{customer.userEmail}</TableCell>
                <TableCell>
                  {customer.birthDate
                    ? new Date(`${customer.birthDate}T00:00:00`).toLocaleDateString(
                        'es-AR',
                      )
                    : '—'}
                </TableCell>
                <TableCell>{customer.phone ?? '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => {
                        setEditing(customer);
                        setDialogOpen(true);
                        save.reset();
                      }}
                    >
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => {
                        setDeleting(customer);
                        remove.reset();
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!customers.isLoading && customers.data?.content.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={6}>
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={customers.data?.totalElements ?? 0}
          page={query.page}
          rowsPerPage={query.size}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, page) => setQuery((q) => ({ ...q, page }))}
          onRowsPerPageChange={(e) =>
            setQuery((q) => ({ ...q, page: 0, size: Number(e.target.value) }))
          }
        />
      </TableContainer>
      <CustomerDialog
        open={dialogOpen}
        customer={editing}
        loading={save.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={(data) => save.mutate(data)}
      />
      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)}>
        <DialogTitle>Eliminar cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas eliminar definitivamente a {deleting?.firstName} {deleting?.lastName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={remove.isPending} onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id)}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        autoHideDuration={3500}
        message={message}
        onClose={() => setMessage('')}
        open={Boolean(message)}
      />
    </Stack>
  );
}
