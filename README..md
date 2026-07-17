# NexoBank

Plataforma bancaria full stack para la gestión de cuentas, movimientos y transferencias.

## Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- React Hook Form
- Zod
- Ant Design

### Infraestructura

- Docker
- Docker Compose
- GitHub Actions

## Documentación del proyecto

- [Arquitectura](docs/architecture.md)
- [Convenciones de código](docs/code-conventions.md)

## Configuración local del backend

El backend usa perfiles de Spring para separar la configuración local y productiva.

### Perfil `dev`

El perfil `dev` se activa por defecto y usa valores locales si no se definen variables de entorno:

- `DB_URL`, por defecto `jdbc:postgresql://localhost:5433/nexobank`
- `DB_USERNAME`, por defecto `postgres`
- `DB_PASSWORD`, por defecto `1234`
- `SERVER_PORT`, por defecto `8080`

### Perfil `prod`

Para producción se debe ejecutar con `SPRING_PROFILES_ACTIVE=prod` y definir obligatoriamente:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

# Configuración local del backend

El backend usa perfiles de Spring para separar la configuración local y productiva.

### Perfil `dev`

El perfil `dev` se activa por defecto y usa valores locales si no se definen variables de entorno:

- `DB_URL`, por defecto `jdbc:postgresql://localhost:5433/nexobank`
- `DB_USERNAME`, por defecto `postgres`
- `DB_PASSWORD`, por defecto `1234`
- `SERVER_PORT`, por defecto `8080`

### Perfil `prod`

Para producción se debe ejecutar con `SPRING_PROFILES_ACTIVE=prod` y definir obligatoriamente:

- `DB_URL`
- `DB_USERNAME`

## Funcionalidades iniciales

- Autenticación
- Clientes
- Cuentas
- Movimientos
- Destinatarios
- Transferencias
- Comprobantes
- Auditoría