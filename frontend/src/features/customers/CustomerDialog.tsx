import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getUsers } from '../users/usersApi';
import type { AuthUser } from '../auth/authTypes';
import type { Customer, CustomerFormData } from './customerTypes';

type Props = {
  open: boolean;
  customer: Customer | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
};

export function CustomerDialog({ open, customer, loading, onClose, onSubmit }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [validation, setValidation] = useState('');
  const users = useQuery({
    queryKey: ['customer-user-options'],
    queryFn: () =>
      getUsers({ search: '', page: 0, size: 100, sortBy: 'email', direction: 'ASC' }),
    enabled: open,
  });
  const options = (users.data?.content ?? []).filter(
    (item) => item.role === 'CUSTOMER' && item.enabled,
  );

  useEffect(() => {
    if (!open) return;
    setFirstName(customer?.firstName ?? '');
    setLastName(customer?.lastName ?? '');
    setDocumentNumber(customer?.documentNumber ?? '');
    setBirthDate(customer?.birthDate ?? '');
    setPhone(customer?.phone ?? '');
    setValidation('');
  }, [open, customer]);
  useEffect(() => {
    if (!open) return;
    setUser(
      customer
        ? (options.find((item) => item.id === customer.userId) ?? {
            id: customer.userId,
            email: customer.userEmail,
            role: 'CUSTOMER',
            enabled: true,
          })
        : null,
    );
  }, [open, customer, users.data]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      setValidation('Selecciona el usuario asociado.');
      return;
    }
    onSubmit({
      userId: user.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentNumber: documentNumber.trim(),
      birthDate: birthDate || null,
      phone: phone.trim(),
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open={open}>
      <form onSubmit={submit}>
        <DialogTitle>{customer ? 'Editar cliente' : 'Crear cliente'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {validation && <Alert severity="error">{validation}</Alert>}
            <Autocomplete
              options={options}
              value={user}
              getOptionLabel={(option) => option.email}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => setUser(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuario"
                  required
                  helperText="Solo usuarios activos con rol Cliente."
                />
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                autoFocus
                fullWidth
                label="Nombre"
                required
                inputProps={{ maxLength: 100 }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Apellido"
                required
                inputProps={{ maxLength: 100 }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Stack>
            <TextField
              fullWidth
              label="Documento"
              required
              inputProps={{ minLength: 5, maxLength: 20, pattern: '[A-Za-z0-9.-]{5,20}' }}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
            <TextField
              fullWidth
              label="Fecha de nacimiento"
              type="date"
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: new Date().toISOString().slice(0, 10) },
              }}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <TextField
              fullWidth
              label="Teléfono"
              inputProps={{ maxLength: 30, pattern: '[+0-9() -]{7,30}' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
