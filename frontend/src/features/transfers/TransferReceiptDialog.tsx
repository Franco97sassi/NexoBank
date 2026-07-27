import { Print } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { TransferReceipt } from './transferTypes';

type Props = {
  open: boolean;
  loading: boolean;
  receipt?: TransferReceipt;
  onClose: () => void;
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography color="text.secondary" variant="caption">
      {label}
    </Typography>
    <Typography>{value}</Typography>
  </Box>
);

export function TransferReceiptDialog({ open, loading, receipt, onClose }: Props) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <Box id="transfer-receipt">
        <DialogTitle>
          <Typography component="span" variant="h5">
            Comprobante de transferencia
          </Typography>
          {receipt && (
            <Typography color="text.secondary" display="block" variant="body2">
              NexoBank · {receipt.receiptNumber}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {loading && <CircularProgress size={28} />}
          {receipt && (
            <Stack divider={<Divider flexItem />} spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                <Detail
                  label="Fecha y hora"
                  value={new Date(receipt.executedAt).toLocaleString('es-AR')}
                />
                <Detail label="ID de operación" value={receipt.transferId} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                <Box flex={1}>
                  <Detail label="Origen" value={receipt.sourceHolder} />
                  <Detail label="Documento" value={receipt.sourceDocument} />
                  <Detail label="CBU" value={receipt.sourceCbu} />
                </Box>
                <Box flex={1}>
                  <Detail label="Destino" value={receipt.destinationHolder} />
                  <Detail label="CBU" value={receipt.destinationCbu} />
                  {receipt.destinationAlias && (
                    <Detail label="Alias" value={receipt.destinationAlias} />
                  )}
                </Box>
              </Stack>
              <Box textAlign="center">
                <Typography color="text.secondary">Importe transferido</Typography>
                <Typography fontWeight={700} variant="h4">
                  {receipt.currency}{' '}
                  {receipt.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography>{receipt.description || 'Sin concepto'}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Box>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          disabled={!receipt}
          onClick={() => window.print()}
          startIcon={<Print />}
          variant="contained"
        >
          Imprimir / guardar PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
