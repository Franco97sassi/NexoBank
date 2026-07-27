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
  Typography,
} from '@mui/material';
import type { Account } from '../accounts/accountTypes';
import type { Beneficiary } from '../beneficiaries/beneficiaryTypes';
import type { CreateTransferData } from './transferTypes';

type Props = {
  accounts: Account[];
  beneficiaries: Beneficiary[];
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransferData) => void;
};

export function TransferDialog(props: Props) {
  if (!props.open) return null;
  return <TransferDialogForm {...props} />;
}

function TransferDialogForm({
  accounts,
  beneficiaries,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE');
  const [data, setData] = useState<CreateTransferData>({
    sourceAccountId: activeAccounts[0]?.id ?? '',
    beneficiaryId: '',
    amount: 0,
    idempotencyKey: crypto.randomUUID(),
    description: '',
  });
  const source = activeAccounts.find((account) => account.id === data.sourceAccountId);
  const available = beneficiaries.filter(
    (beneficiary) =>
      beneficiary.active &&
      beneficiary.customerId === source?.customerId &&
      beneficiary.cbu !== source?.cbu,
  );
  const valid = Boolean(
    source && data.beneficiaryId && data.amount > 0 && data.amount <= source.balance,
  );
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open>
      <DialogTitle>Nueva transferencia</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Cuenta de origen"
            select
            value={data.sourceAccountId}
            onChange={(event) =>
              setData((value) => ({
                ...value,
                sourceAccountId: event.target.value,
                beneficiaryId: '',
              }))
            }
          >
            {activeAccounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.alias} · {account.currency} · Saldo{' '}
                {account.balance.toLocaleString('es-AR')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Destinatario"
            select
            value={data.beneficiaryId}
            onChange={(event) =>
              setData((value) => ({ ...value, beneficiaryId: event.target.value }))
            }
          >
            {available.map((beneficiary) => (
              <MenuItem key={beneficiary.id} value={beneficiary.id}>
                {beneficiary.displayName} · {beneficiary.cbu}
              </MenuItem>
            ))}
          </TextField>
          {!available.length && source && (
            <Typography color="text.secondary" variant="body2">
              Esta cuenta no tiene destinatarios activos disponibles.
            </Typography>
          )}
          <TextField
            inputProps={{ min: 0.01, step: 0.01 }}
            label="Importe"
            onChange={(event) =>
              setData((value) => ({ ...value, amount: Number(event.target.value) }))
            }
            type="number"
            value={data.amount || ''}
          />
          <TextField
            inputProps={{ maxLength: 255 }}
            label="Concepto"
            onChange={(event) =>
              setData((value) => ({ ...value, description: event.target.value }))
            }
            value={data.description}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!valid || loading}
          onClick={() => onSubmit(data)}
          variant="contained"
        >
          Transferir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
