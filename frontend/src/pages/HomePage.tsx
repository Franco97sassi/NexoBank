import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { getHealth } from '../api/healthApi';

export function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: false,
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h2" gutterBottom variant="h4">
          Plataforma bancaria NexoBank
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Base frontend preparada con React, TypeScript, Vite, TanStack Query,
          Material UI, Axios y React Router.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                        <Typography component="h3" variant="h6">
              Estado de la API
            </Typography>
            {healthQuery.isSuccess && (
              <Alert severity="success">
                {healthQuery.data.application}: {healthQuery.data.status} / DB:{' '}
                {healthQuery.data.database}
              </Alert>
            )}
            {healthQuery.isError && (
              <Alert severity="warning">
                No se pudo consultar la API. Verificá que el backend esté levantado.
              </Alert>
            )}
            <Button onClick={() => void healthQuery.refetch()} variant="contained">
              Consultar health check
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
