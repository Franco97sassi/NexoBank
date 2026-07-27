import { useState } from 'react';
import { Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
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
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAuditEvents } from '../features/audit/auditApi';
import type { AuditQuery } from '../features/audit/auditTypes';

const initialQuery: AuditQuery = {
  eventType: '',
  entityType: '',
  from: '',
  to: '',
  page: 0,
  size: 20,
};

export function AuditPage() {
  const [filters, setFilters] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const events = useQuery({
    queryKey: ['audit-events', query],
    queryFn: () => getAuditEvents(query),
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">
          Auditoría
        </Typography>
        <Typography color="text.secondary">
          Consulta los accesos y cambios sensibles realizados en NexoBank.
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Tipo de evento"
            placeholder="LOGIN, POST_CUSTOMER…"
            size="small"
            value={filters.eventType}
            onChange={(event) =>
              setFilters((value) => ({ ...value, eventType: event.target.value }))
            }
          />
          <TextField
            label="Entidad"
            placeholder="CUSTOMER, TRANSFER…"
            size="small"
            value={filters.entityType}
            onChange={(event) =>
              setFilters((value) => ({ ...value, entityType: event.target.value }))
            }
          />
          <TextField
            slotProps={{ inputLabel: { shrink: true } }}
            label="Desde"
            size="small"
            type="datetime-local"
            value={filters.from}
            onChange={(event) =>
              setFilters((value) => ({ ...value, from: event.target.value }))
            }
          />
          <TextField
            slotProps={{ inputLabel: { shrink: true } }}
            label="Hasta"
            size="small"
            type="datetime-local"
            value={filters.to}
            onChange={(event) =>
              setFilters((value) => ({ ...value, to: event.target.value }))
            }
          />
          <Button
            startIcon={<Search />}
            variant="contained"
            onClick={() => setQuery({ ...filters, page: 0 })}
          >
            Filtrar
          </Button>
        </Stack>
      </Paper>
      {events.isError && (
        <Alert severity="error">No se pudo cargar el registro de auditoría.</Alert>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="Registro de auditoría">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Evento</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Entidad</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.isLoading && (
              <TableRow>
                <TableCell colSpan={6}>Cargando eventos…</TableCell>
              </TableRow>
            )}
            {events.data?.content.map((event) => (
              <TableRow hover key={event.id}>
                <TableCell>{new Date(event.createdAt).toLocaleString('es-AR')}</TableCell>
                <TableCell>
                  <Chip label={event.eventType} size="small" />
                </TableCell>
                <TableCell>{event.actorEmail ?? 'Sistema'}</TableCell>
                <TableCell>
                  {event.entityType}
                  {event.entityId ? ` · ${event.entityId.slice(0, 8)}` : ''}
                </TableCell>
                <TableCell>{event.ipAddress ?? '—'}</TableCell>
                <TableCell sx={{ maxWidth: 280, overflowWrap: 'anywhere' }}>
                  {event.metadata ?? '—'}
                </TableCell>
              </TableRow>
            ))}
            {!events.isLoading && events.data?.content.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={6}>
                  No se encontraron eventos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={events.data?.totalElements ?? 0}
          page={query.page}
          rowsPerPage={query.size}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={(_, page) => setQuery((value) => ({ ...value, page }))}
          onRowsPerPageChange={(event) =>
            setQuery((value) => ({ ...value, page: 0, size: Number(event.target.value) }))
          }
        />
      </TableContainer>
    </Stack>
  );
}
