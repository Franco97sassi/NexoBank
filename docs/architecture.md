# Arquitectura de NexoBank

NexoBank se plantea como una plataforma bancaria full stack separada en backend, frontend e infraestructura. El objetivo de esta arquitectura es mantener responsabilidades claras, facilitar el testing y permitir una evolución gradual hacia integraciones externas, auditoría, fraude y despliegue en la nube.

## Vista general

```text
Usuario
  |
  v
Frontend React
  |
  | HTTP/JSON
  v
Backend Spring Boot
  |
  | JPA/Flyway
  v
PostgreSQL
```

## Componentes principales

### Frontend

El frontend será una aplicación React con TypeScript. Sus responsabilidades serán:

- Presentar pantallas para login, dashboard, cuentas, movimientos, destinatarios y transferencias.
- Validar formularios en cliente antes de enviar datos al backend.
- Consumir la API REST del backend mediante HTTP/JSON.
- Gestionar estado de servidor con TanStack Query.

### Backend

El backend será una aplicación Spring Boot organizada por capas. Sus responsabilidades serán:

- Exponer una API REST para autenticación, clientes, cuentas, movimientos y transferencias.
- Ejecutar reglas de negocio bancarias.
- Validar requests de entrada con DTOs y Bean Validation.
- Persistir datos en PostgreSQL usando Spring Data JPA.
- Versionar cambios de base de datos con Flyway.
- Registrar eventos relevantes para auditoría.

### Base de datos

PostgreSQL será la base de datos principal. La estructura se administrará con migraciones Flyway versionadas en el repositorio.

Las tablas esperadas para el dominio inicial son:

- `users`
- `roles`
- `customers`
- `accounts`
- `beneficiaries`
- `transfers`
- `ledger_entries`
- `audit_events`
- `fraud_alerts`

## Capas del backend

El backend debe organizarse por paquetes funcionales y capas internas.

```text
com.nexobank.backend
  ├── common
  │   ├── error
  │   ├── validation
  │   └── config
  ├── auth
  │   ├── controller
  │   ├── service
  │   ├── dto
  │   └── domain
  ├── customer
  │   ├── controller
  │   ├── service
  │   ├── repository
  │   ├── dto
  │   └── domain
  ├── account
  ├── beneficiary
  ├── movement
  ├── transfer
  ├── ledger
  ├── audit
  └── fraud
```

### Controller

Responsable de recibir requests HTTP, validar entradas y devolver respuestas HTTP. No debe contener reglas de negocio complejas.

### Service

Responsable de la lógica de negocio y coordinación entre repositorios, validaciones de dominio y operaciones transaccionales.

### Repository

Responsable de acceder a la base de datos mediante Spring Data JPA.

### Domain

Contiene entidades JPA, enums y conceptos del dominio bancario.

### DTO

Contiene objetos de entrada y salida para la API. Las entidades JPA no deben exponerse directamente en los controllers.

## Reglas arquitectónicas

- Los controllers solo deben depender de services y DTOs.
- Los services pueden depender de repositories, domain objects y otros services cuando sea necesario.
- Los repositories no deben depender de controllers ni services.
- Las entidades JPA no deben devolverse directamente desde la API.
- Las migraciones Flyway son la fuente de verdad del esquema de base de datos.
- Las operaciones que modifiquen dinero o saldos deben ser transaccionales.
- Las transferencias deben diseñarse para ser idempotentes.
- Los errores de API deben responder con un formato consistente.
- Los eventos sensibles deben registrarse para auditoría.

## Configuración por entorno

La aplicación usa perfiles de Spring:

- `dev`: configuración local con valores por defecto para desarrollo.
- `prod`: configuración productiva mediante variables de entorno obligatorias.

La configuración común vive en `application.properties`, mientras que los valores específicos por entorno viven en `application-dev.properties` y `application-prod.properties`.

## Decisiones iniciales

- Se usa una API REST monolítica como primera versión para reducir complejidad.
- Se usa PostgreSQL como base transaccional principal.
- Se usa Flyway para mantener cambios de esquema versionados.
- Se separan DTOs y entidades para evitar acoplar la API al modelo de persistencia.
- Se prioriza una arquitectura por dominio para que el proyecto pueda crecer sin concentrar toda la lógica en paquetes genéricos.
