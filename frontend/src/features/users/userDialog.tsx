import { useEffect, useState, type FormEvent } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!open) return;
    setEmail(user?.email ?? '');
    setPassword('');
    setRole(user?.role ?? 'CUSTOMER');
    setEnabled(user?.enabled ?? true);
  }, [open, user]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ email: email.trim(), password: password || undefined, role, enabled });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open={open}>
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
