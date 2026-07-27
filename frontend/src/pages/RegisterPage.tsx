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
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ email, password });
      navigate('/', { replace: true });
    } catch {
      setError('No se pudo crear la cuenta. Verificá los datos e intentá nuevamente.');
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
              Crear cuenta
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Registrate para acceder a NexoBank.
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
            autoComplete="new-password"
            helperText="Mínimo 8 caracteres"
            label="Contraseña"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Creando...' : 'Crear cuenta'}
          </Button>
          <Button component={Link} to="/login" variant="text">
            Ya tengo cuenta
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
