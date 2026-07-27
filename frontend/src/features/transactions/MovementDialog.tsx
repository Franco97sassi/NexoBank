import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import type { Account } from '../accounts/accountTypes';
import type { OperationData, OperationType } from './transactionTypes';

type Props = {
  accounts: Account[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (accountId: string, type: OperationType, data: OperationData) => void;
  open: boolean;
};

export function MovementDialog(props: Props) {
  if (!props.open) return null;
  return <MovementDialogForm {...props} />;
}

function MovementDialogForm({ accounts, loading, onClose, onSubmit }: Props) {
  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE');
  const [accountId, setAccountId] = useState(activeAccounts[0]?.id ?? '');
  const [type, setType] = useState<OperationType>('deposits');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const valid =
    Boolean(accountId) &&
    Number(amount) > 0 &&
    (type !== 'adjustments' || description.trim().length >= 3);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open>
      <DialogTitle>Registrar movimiento</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Cuenta"
            onChange={(event) => setAccountId(event.target.value)}
            select
            value={accountId}
          >
            {activeAccounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.alias} · {account.currency} {account.balance.toFixed(2)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Operación"
            onChange={(event) => setType(event.target.value as OperationType)}
            select
            value={type}
          >
            <MenuItem value="deposits">Depósito</MenuItem>
            <MenuItem value="withdrawals">Extracción</MenuItem>
            <MenuItem value="adjustments">Ajuste positivo</MenuItem>
          </TextField>
          <TextField
            inputProps={{ min: '0.01', step: '0.01' }}
            label="Importe"
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            value={amount}
          />
          <TextField
            label="Descripción"
            onChange={(event) => setDescription(event.target.value)}
            required={type === 'adjustments'}
            value={description}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!valid || loading}
          onClick={() =>
            onSubmit(accountId, type, { amount: Number(amount), description })
          }
          variant="contained"
        >
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
