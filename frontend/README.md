# Frontend de NexoBank

Aplicación web de la plataforma bancaria demostrativa **NexoBank**. Esta SPA permite operar y administrar clientes, cuentas, movimientos, transferencias, destinatarios, asientos contables, alertas de fraude y eventos de auditoría mediante la API REST del proyecto.

> NexoBank es un proyecto demostrativo: no es una entidad financiera ni procesa dinero real.

## Stack

- React 19 y TypeScript.
- Vite para desarrollo y compilación.
- Material UI para la interfaz.
- TanStack Query y Axios para la comunicación con la API.
- React Router para navegación y rutas protegidas.
- Vitest y Testing Library para pruebas de componentes.
- Playwright para pruebas end-to-end.
- ESLint y Prettier para calidad y formato de código.

## Requisitos

- Node.js y npm.
- El backend de NexoBank disponible en `http://localhost:8080` o en la URL configurada mediante `VITE_API_BASE_URL`.

Para levantar toda la plataforma con PostgreSQL, backend y frontend, consulte el [README principal](../README.md#inicio-rápido).

## Configuración local

Desde el directorio `frontend`:

```bash
cp .env.example .env
npm ci
npm run dev
```

La aplicación queda disponible en <http://localhost:5173>.

La variable de entorno admitida es:

| Variable            | Valor local             | Descripción                       |
| ------------------- | ----------------------- | --------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base del backend de NexoBank. |

Las solicitudes se envían con credenciales para que el navegador pueda incluir la cookie `HttpOnly` usada al renovar la sesión. Durante el desarrollo, Vite también redirige las rutas `/api` y `/api-docs` al backend local.

## Scripts disponibles

| Comando                 | Propósito                                                |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Inicia el servidor de desarrollo de Vite.                |
| `npm run build`         | Valida TypeScript y genera la compilación de producción. |
| `npm run preview`       | Sirve localmente la compilación de producción.           |
| `npm test`              | Ejecuta las pruebas unitarias y de componentes una vez.  |
| `npm run test:watch`    | Ejecuta Vitest en modo interactivo.                      |
| `npm run test:coverage` | Ejecuta las pruebas y genera el reporte de cobertura.    |
| `npm run test:e2e`      | Ejecuta las pruebas end-to-end con Playwright.           |
| `npm run lint`          | Ejecuta ESLint sin permitir advertencias.                |
| `npm run format`        | Comprueba el formato con Prettier.                       |
| `npm run format:write`  | Aplica el formato de Prettier.                           |

## Pruebas end-to-end

Las pruebas E2E necesitan que el frontend y el backend estén disponibles. Desde la raíz del repositorio puede iniciar el entorno completo y luego ejecutar Playwright:

```bash
docker compose up --build -d
cd frontend
npm run test:e2e
```

## Estructura principal

```text
src/
├── api/          # Cliente HTTP y endpoints compartidos
├── app/          # Componente raíz y proveedores globales
├── components/   # Componentes reutilizables y layout
├── features/     # Lógica, tipos y componentes por dominio
├── pages/        # Pantallas asociadas a las rutas
├── routes/       # Definición y protección de rutas
└── test/         # Configuración común de pruebas
e2e/              # Escenarios de Playwright
```

## Autenticación y autorización

El access token se mantiene en memoria y se agrega como encabezado `Authorization: Bearer ...` a las solicitudes autenticadas. La renovación de sesión utiliza una cookie `HttpOnly`; ante una respuesta `401`, el cliente intenta renovar el token una sola vez y limpia la sesión si la renovación falla.

La interfaz incluye rutas autenticadas y secciones exclusivas para administradores. La autorización definitiva siempre debe aplicarse también en el backend.

## Compilación para producción

```bash
npm ci
npm run build
```

Los archivos estáticos se generan en `dist/`. El `Dockerfile` del frontend compila la aplicación y la sirve mediante Nginx; para construir la plataforma completa se recomienda usar el `docker-compose.yml` ubicado en la raíz del repositorio.

## Más documentación

- [Descripción general y puesta en marcha](../README.md)
- [Arquitectura](../docs/architecture.md)
- [Contrato de la API](../docs/api.md)
- [Estrategia de pruebas](../docs/testing.md)
- [Convenciones de código](../docs/code-conventions.md)
