import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import { getCustomers } from '../customers/customersApi';
import type { Customer } from '../customers/customerTypes';
import type {
  Account,
  AccountStatus,
  AccountType,
  CreateAccountData,
  Currency,
  UpdateAccountData,
} from './accountTypes';

type Props = {
  account: Account | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountData | UpdateAccountData) => void;
};

export function AccountDialog({ account, loading, open, onClose, onSubmit }: Props) {
  if (!open) return null;
  return (
    <AccountDialogForm
      account={account}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function AccountDialogForm({ account, loading, onClose, onSubmit }: Omit<Props, 'open'>) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accountType, setAccountType] = useState<AccountType>(
    account?.accountType ?? 'SAVINGS',
  );
  const [currency, setCurrency] = useState<Currency>(account?.currency ?? 'ARS');
  const [alias, setAlias] = useState(account?.alias ?? '');
  const [status, setStatus] = useState<AccountStatus>(account?.status ?? 'ACTIVE');
  const [validation, setValidation] = useState('');
  const customers = useQuery({
    queryKey: ['account-customer-options'],
    queryFn: () =>
      getCustomers({
        search: '',
        page: 0,
        size: 100,
        sortBy: 'lastName',
        direction: 'ASC',
      }),
    enabled: !account,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (account) {
      onSubmit({ alias: alias.trim(), status });
      return;
    }
    if (!customer) {
      setValidation('Selecciona el cliente titular.');
      return;
    }
    onSubmit({
      customerId: customer.id,
      accountType,
      currency,
      alias: alias.trim() || undefined,
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open>
      <form onSubmit={submit}>
        <DialogTitle>{account ? 'Editar cuenta' : 'Crear cuenta'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            {validation && <Alert severity="error">{validation}</Alert>}
            {account ? (
              <TextField disabled label="Titular" value={account.customerName} />
            ) : (
              <Autocomplete
                getOptionLabel={(option) =>
                  `${option.lastName}, ${option.firstName} · ${option.documentNumber}`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={customers.isLoading}
                onChange={(_, value) => setCustomer(value)}
                options={customers.data?.content ?? []}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente titular" required />
                )}
                value={customer}
              />
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl disabled={Boolean(account)} fullWidth>
                <InputLabel id="account-type-label">Tipo</InputLabel>
                <Select
                  label="Tipo"
                  labelId="account-type-label"
                  onChange={(event) => setAccountType(event.target.value as AccountType)}
                  value={accountType}
                >
                  <MenuItem value="SAVINGS">Caja de ahorro</MenuItem>
                  <MenuItem value="CHECKING">Cuenta corriente</MenuItem>
                </Select>
              </FormControl>
              <FormControl disabled={Boolean(account)} fullWidth>
                <InputLabel id="account-currency-label">Moneda</InputLabel>
                <Select
                  label="Moneda"
                  labelId="account-currency-label"
                  onChange={(event) => setCurrency(event.target.value as Currency)}
                  value={currency}
                >
                  <MenuItem value="ARS">ARS</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              helperText={
                account
                  ? undefined
                  : 'Opcional: se genera automáticamente si queda vacío.'
              }
              inputProps={{ minLength: 6, maxLength: 30, pattern: '[A-Za-z0-9.]{6,30}' }}
              label="Alias"
              onChange={(event) => setAlias(event.target.value)}
              required={Boolean(account)}
              value={alias}
            />
            {account && (
              <FormControl fullWidth>
                <InputLabel id="account-status-label">Estado</InputLabel>
                <Select
                  label="Estado"
                  labelId="account-status-label"
                  onChange={(event) => setStatus(event.target.value as AccountStatus)}
                  value={status}
                >
                  <MenuItem value="ACTIVE">Activa</MenuItem>
                  <MenuItem value="BLOCKED">Bloqueada</MenuItem>
                  <MenuItem value="CLOSED">Cerrada</MenuItem>
                </Select>
              </FormControl>
            )}
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
