import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        '/';
      navigate(redirectTo, { replace: true });
    } catch {
      setError('No se pudo iniciar sesión. Revisá el email y la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <Box>
            <Typography component="h2" variant="h4">
              Iniciar sesión
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Accedé a tu cuenta de NexoBank.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            autoComplete="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            label="Contraseña"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <Button component={Link} to="/register" variant="text">
            Crear una cuenta
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
