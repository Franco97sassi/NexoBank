import { useState } from 'react';
import { MenuBook, Search, VisibilityOutlined } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getLedgerEntries, getLedgerJournal } from '../features/ledger/ledgerApi';
import type { LedgerQuery } from '../features/ledger/ledgerTypes';

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);

export function LedgerPage() {
  const [filters, setFilters] = useState({ accountId: '', transferId: '' });
  const [query, setQuery] = useState<LedgerQuery>({ ...filters, page: 0, size: 20 });
  const [journalId, setJournalId] = useState<string | null>(null);
  const entries = useQuery({
    queryKey: ['ledger', query],
    queryFn: () => getLedgerEntries(query),
  });
  const journal = useQuery({
    queryKey: ['ledger-journal', journalId],
    queryFn: () => getLedgerJournal(journalId!),
    enabled: Boolean(journalId),
  });

  const rows = (items = entries.data?.content ?? []) =>
    items.map((entry) => (
      <TableRow hover key={entry.id}>
        <TableCell>{new Date(entry.createdAt).toLocaleString('es-AR')}</TableCell>
        <TableCell>{entry.accountCode}</TableCell>
        <TableCell>
          <Chip
            color={entry.entryType === 'CREDIT' ? 'success' : 'error'}
            label={entry.entryType === 'CREDIT' ? 'Crédito' : 'Débito'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">{money(entry.amount, entry.currency)}</TableCell>
        <TableCell>{entry.description}</TableCell>
        <TableCell align="right">
          <Tooltip title="Ver asiento completo">
            <IconButton onClick={() => setJournalId(entry.journalId)}>
              <VisibilityOutlined />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
          Libro mayor
        </Typography>
        <Typography color="text.secondary">
          Consulta débitos, créditos y asientos contables completos.
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="ID de cuenta"
            onChange={(event) =>
              setFilters((value) => ({ ...value, accountId: event.target.value }))
            }
            size="small"
            value={filters.accountId}
          />
          <TextField
            fullWidth
            label="ID de transferencia"
            onChange={(event) =>
              setFilters((value) => ({ ...value, transferId: event.target.value }))
            }
            size="small"
            value={filters.transferId}
          />
          <Button
            onClick={() => setQuery({ ...filters, page: 0, size: query.size })}
            startIcon={<Search />}
            variant="contained"
          >
            Filtrar
          </Button>
        </Stack>
      </Paper>
      {entries.isError && (
        <Alert severity="error">No se pudo cargar el libro mayor.</Alert>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="Libro mayor">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Cuenta contable</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Importe</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Asiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Cargando entradas…</TableCell>
              </TableRow>
            ) : (
              rows()
            )}
            {!entries.isLoading && !entries.data?.content.length && (
              <TableRow>
                <TableCell align="center" colSpan={6}>
                  No se encontraron entradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={entries.data?.totalElements ?? 0}
          onPageChange={(_, page) => setQuery((value) => ({ ...value, page }))}
          onRowsPerPageChange={(event) =>
            setQuery((value) => ({ ...value, page: 0, size: Number(event.target.value) }))
          }
          page={query.page}
          rowsPerPage={query.size}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </TableContainer>
      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={() => setJournalId(null)}
        open={Boolean(journalId)}
      >
        <DialogTitle>Asiento contable {journalId}</DialogTitle>
        <DialogContent dividers>
          {journal.isError && (
            <Alert severity="error">No se pudo cargar el asiento.</Alert>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cuenta contable</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Importe</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {journal.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>Cargando asiento…</TableCell>
                </TableRow>
              ) : (
                rows(journal.data)
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJournalId(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
