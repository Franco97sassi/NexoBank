import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { useAuth } from '../features/auth/AuthContext';

export function DashboardPage() {
  const { logout, user } = useAuth();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h2" gutterBottom variant="h4">
          Dashboard NexoBank
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Sesión autenticada lista para conectar las próximas funcionalidades bancarias.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography component="h3" variant="h6">
              Usuario autenticado
            </Typography>
            <Alert severity="success">
              {user?.email} / Rol: {user?.role}
            </Alert>
            <Button color="secondary" onClick={() => void logout()} variant="outlined">
              Cerrar sesión
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
