# NexoBank

NexoBank es una plataforma bancaria full stack para administrar usuarios, clientes, cuentas, movimientos,
destinatarios y transferencias. Incluye autenticación con JWT y refresh tokens, comprobantes, auditoría,
alertas de fraude y paneles diferenciados para clientes y administradores.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA, Flyway, springdoc-openapi |
| Frontend | React, TypeScript, Vite, TanStack Query, Material UI |
| Datos | PostgreSQL 17 |
| Calidad | JUnit, H2, JaCoCo, Vitest, Testing Library, Playwright, ESLint, Prettier |
| Infraestructura | Docker y Docker Compose |

## Requisitos

- Docker Engine con Docker Compose v2, para ejecutar toda la solución; o
- Java 21, Node.js 20 o superior y PostgreSQL 17, para desarrollo sin contenedores.

## Inicio rápido con Docker

```bash
git clone <url-del-repositorio>
cd NexoBank
docker compose up --build
```

Cuando los servicios estén listos:

- aplicación web: <http://localhost:5173>
- API: <http://localhost:8080/api>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- especificación OpenAPI: <http://localhost:8080/api-docs>
- estado del backend: <http://localhost:8080/api/health>
- PostgreSQL: `localhost:5434` (base `nexobank`)

Para detener la solución use `docker compose down`. Agregue `-v` si también desea eliminar los datos locales.

> Los valores de `docker-compose.yml` son exclusivamente de desarrollo. Nunca use esas credenciales ni el
> secreto JWT predeterminado en producción.

## Desarrollo local

### Backend

1. Inicie PostgreSQL con `docker compose up -d postgres`.
2. Ajuste `DB_URL` si es necesario; el perfil `dev` usa por defecto
   `jdbc:postgresql://localhost:5433/nexobank`, mientras que Compose publica PostgreSQL en el puerto `5434`.
3. Ejecute:

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:5434/nexobank ./mvnw spring-boot:run
```

Flyway crea y actualiza el esquema automáticamente. La configuración común está en
`application.properties` y los valores locales en `application-dev.properties`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

`VITE_API_BASE_URL` debe apuntar al backend y vale `http://localhost:8080` en el ejemplo.

## Uso de la API

Las rutas de negocio usan el prefijo `/api/v1`. Registre un usuario o inicie sesión en
`/api/v1/auth`, copie `accessToken` y envíelo como `Authorization: Bearer <token>` en las rutas protegidas.
Los permisos dependen del rol (`CUSTOMER`, `EMPLOYEE` o `ADMIN`).

La colección [`docs/postman/NexoBank.postman_collection.json`](docs/postman/NexoBank.postman_collection.json)
incluye ejemplos y guarda automáticamente los tokens y los identificadores creados. También puede explorar y
ejecutar cada operación desde Swagger UI. Consulte la [guía de API](docs/api.md) para conocer el flujo recomendado.

## Pruebas y controles

```bash
# Backend
cd backend
./mvnw test
./mvnw verify

# Frontend
cd ../frontend
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
```

El informe JaCoCo se genera en `backend/target/site/jacoco/index.html`. La cobertura frontend se obtiene con
`npm run test:coverage`. Playwright puede requerir instalar Chromium previamente con
`npx playwright install chromium`.

## Documentación

- [Arquitectura y decisiones](docs/architecture.md)
- [Modelo de datos y DER](docs/data-model.md)
- [Diagramas de arquitectura y flujos](docs/flows.md)
- [API, autenticación y Swagger](docs/api.md)
- [Colección Postman](docs/postman/NexoBank.postman_collection.json)
- [Estrategia de pruebas](docs/testing.md)
- [Convenciones de código](docs/code-conventions.md)

## Estructura

```text
NexoBank/
├── backend/                 # API REST, dominio, seguridad y migraciones
├── frontend/                # SPA React
├── docs/                    # Documentación técnica y artefactos de API
├── docker-compose.yml       # Entorno local completo
└── README.md
```

## Configuración sensible

En producción active `SPRING_PROFILES_ACTIVE=prod` y defina, como mínimo, `DB_URL`, `DB_USERNAME`,
`DB_PASSWORD`, `JWT_SECRET` (aleatorio y de al menos 32 bytes) y `CORS_ALLOWED_ORIGINS`. Los secretos no deben
versionarse; inyéctelos mediante el gestor de secretos de la plataforma de despliegue.
