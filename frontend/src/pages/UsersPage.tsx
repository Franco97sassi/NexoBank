import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { Add, DeleteOutline, EditOutlined, Search } from '@mui/icons-material';

import type { AuthUser } from '../features/auth/authTypes';
import { UserDialog } from '../features/users/UserDialog';
import { createUser, deleteUser, getUsers, updateUser } from '../features/users/usersApi';
import type { UserFormData, UserQuery } from '../features/users/userTypes';

const roleLabels = { CUSTOMER: 'Cliente', EMPLOYEE: 'Empleado', ADMIN: 'Administrador' };

function errorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'No se pudo completar la operación.';
  }
  return 'No se pudo completar la operación.';
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<UserQuery>({
    search: '',
    page: 0,
    size: 10,
    sortBy: 'email',
    direction: 'ASC',
  });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState('');

  const users = useQuery({
    queryKey: ['users', query],
    queryFn: () => getUsers(query),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['users'] });
  const save = useMutation({
    mutationFn: (data: UserFormData) =>
      editing ? updateUser(editing.id, data) : createUser(data),
    onSuccess: async () => {
      setDialogOpen(false);
      setMessage(editing ? 'Usuario actualizado.' : 'Usuario creado.');
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: async () => {
      setDeleting(null);
      setMessage('Usuario eliminado.');
      await refresh();
    },
  });

  const sort = (sortBy: UserQuery['sortBy']) => {
    setQuery((current) => ({
      ...current,
      page: 0,
      sortBy,
      direction:
        current.sortBy === sortBy && current.direction === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Gestión de usuarios
        </Typography>
        <Typography color="text.secondary">
          Administra accesos, roles y estado de las cuentas.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Buscar por correo"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter')
                setQuery((current) => ({ ...current, search, page: 0 }));
            }}
            size="small"
            value={search}
          />
          <Button
            onClick={() => setQuery((current) => ({ ...current, search, page: 0 }))}
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
            Nuevo usuario
          </Button>
        </Stack>
      </Paper>

      {users.isError && <Alert severity="error">{errorMessage(users.error)}</Alert>}
      {(save.isError || remove.isError) && (
        <Alert severity="error">{errorMessage(save.error ?? remove.error)}</Alert>
      )}

      <TableContainer component={Paper}>
        <Table aria-label="Usuarios">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={query.sortBy === 'email'}
                  direction={query.direction.toLowerCase() as 'asc' | 'desc'}
                  onClick={() => sort('email')}
                >
                  Correo
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={query.sortBy === 'role'}
                  direction={query.direction.toLowerCase() as 'asc' | 'desc'}
                  onClick={() => sort('role')}
                >
                  Rol
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={query.sortBy === 'enabled'}
                  direction={query.direction.toLowerCase() as 'asc' | 'desc'}
                  onClick={() => sort('enabled')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.isLoading && (
              <TableRow>
                <TableCell colSpan={4}>Cargando usuarios…</TableCell>
              </TableRow>
            )}
            {users.data?.content.map((user) => (
              <TableRow hover key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{roleLabels[user.role]}</TableCell>
                <TableCell>
                  <Chip
                    color={user.enabled ? 'success' : 'default'}
                    label={user.enabled ? 'Activo' : 'Deshabilitado'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => {
                        setEditing(user);
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
                        setDeleting(user);
                        remove.reset();
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!users.isLoading && users.data?.content.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={4}>
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={users.data?.totalElements ?? 0}
          onPageChange={(_, page) => setQuery((current) => ({ ...current, page }))}
          onRowsPerPageChange={(event) =>
            setQuery((current) => ({
              ...current,
              page: 0,
              size: Number(event.target.value),
            }))
          }
          page={query.page}
          rowsPerPage={query.size}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <UserDialog
        loading={save.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={(data) => save.mutate(data)}
        open={dialogOpen}
        user={editing}
      />
      <Dialog onClose={() => setDeleting(null)} open={Boolean(deleting)}>
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas eliminar definitivamente a {deleting?.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={remove.isPending} onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id)}
            variant="contained"
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
