import { useState, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';

import type { AuthUser } from '../auth/authTypes';
import type { UserFormData, UserRole } from './userTypes';

type UserDialogProps = {
  open: boolean;
  user: AuthUser | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
};

export function UserDialog({ open, user, loading, onClose, onSubmit }: UserDialogProps) {
  if (!open) return null;
  return (
    <UserDialogForm user={user} loading={loading} onClose={onClose} onSubmit={onSubmit} />
  );
}

function UserDialogForm({
  user,
  loading,
  onClose,
  onSubmit,
}: Omit<UserDialogProps, 'open'>) {
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'CUSTOMER');
  const [enabled, setEnabled] = useState(user?.enabled ?? true);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ email: email.trim(), password: password || undefined, role, enabled });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open>
      <form onSubmit={submit}>
        <DialogTitle>{user ? 'Editar usuario' : 'Crear usuario'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Correo electrónico"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
            <TextField
              fullWidth
              helperText={
                user
                  ? 'Déjala vacía para conservar la contraseña actual.'
                  : 'Mínimo 8 caracteres.'
              }
              inputProps={{ minLength: 8 }}
              label={user ? 'Nueva contraseña' : 'Contraseña'}
              onChange={(event) => setPassword(event.target.value)}
              required={!user}
              type="password"
              value={password}
            />
            <FormControl fullWidth>
              <InputLabel id="user-role-label">Rol</InputLabel>
              <Select
                label="Rol"
                labelId="user-role-label"
                onChange={(event) => setRole(event.target.value as UserRole)}
                value={role}
              >
                <MenuItem value="CUSTOMER">Cliente</MenuItem>
                <MenuItem value="EMPLOYEE">Empleado</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(event) => setEnabled(event.target.checked)}
                />
              }
              label="Usuario habilitado"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={loading} type="submit" variant="contained">
            {loading ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
