import { AccountCircle, Refresh } from '@mui/icons-material';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '../features/users/usersApi';

const roleLabels = { CUSTOMER: 'Cliente', EMPLOYEE: 'Empleado', ADMIN: 'Administrador' };

export function ProfilePage() {
  const profile = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });

  return (
    <Stack spacing={3}>
      <div>
        <Typography component="h1" variant="h4">
          Mi perfil
        </Typography>
        <Typography color="text.secondary">
          Información actualizada de tu sesión en NexoBank.
        </Typography>
      </div>
      {profile.isError && <Alert severity="error">No se pudo cargar tu perfil.</Alert>}
      <Paper sx={{ maxWidth: 620, p: 3 }}>
        {profile.isLoading ? (
          <CircularProgress />
        ) : (
          profile.data && (
            <Stack spacing={2}>
              <AccountCircle color="primary" sx={{ fontSize: 64 }} />
              <Typography variant="h5">{profile.data.email}</Typography>
              <Typography color="text.secondary">
                Identificador: {profile.data.id}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip color="primary" label={roleLabels[profile.data.role]} />
                <Chip
                  color={profile.data.enabled ? 'success' : 'default'}
                  label={profile.data.enabled ? 'Activo' : 'Deshabilitado'}
                />
              </Stack>
              <Button
                onClick={() => void profile.refetch()}
                startIcon={<Refresh />}
                sx={{ alignSelf: 'flex-start' }}
                variant="outlined"
              >
                Actualizar perfil
              </Button>
            </Stack>
          )
        )}
      </Paper>
    </Stack>
  );
}
