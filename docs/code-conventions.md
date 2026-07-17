# Convenciones de código de NexoBank

Este documento define las reglas base para mantener el código de NexoBank consistente, legible y fácil de evolucionar.

## Convenciones generales

- Usar nombres descriptivos y evitar abreviaturas innecesarias.
- Mantener funciones y métodos pequeños, con una responsabilidad clara.
- No mezclar lógica de negocio con lógica de transporte HTTP.
- No exponer entidades JPA directamente en las respuestas de la API.
- Preferir código explícito antes que soluciones demasiado mágicas.
- Escribir documentación corta cuando una decisión de diseño no sea obvia.

## Backend Java / Spring Boot

### Paquetes

Los paquetes deben organizarse por dominio funcional:

```text
com.nexobank.backend.<dominio>.<capa>
```

Ejemplos:

```text
com.nexobank.backend.customer.controller
com.nexobank.backend.customer.service
com.nexobank.backend.customer.repository
com.nexobank.backend.customer.dto
com.nexobank.backend.customer.domain
```

### Nombres de clases

- Controllers: `CustomerController`, `TransferController`.
- Services: `CustomerService`, `TransferService`.
- Repositories: `CustomerRepository`, `AccountRepository`.
- Requests: `CreateCustomerRequest`, `CreateTransferRequest`.
- Responses: `CustomerResponse`, `TransferResponse`.
- Entities: `Customer`, `Account`, `Transfer`.
- Enums: `AccountStatus`, `TransferStatus`.
- Exceptions: `CustomerNotFoundException`, `InsufficientFundsException`.

### Controllers

- Deben mapear rutas y delegar al service correspondiente.
- Deben usar DTOs para requests y responses.
- Deben aplicar validaciones con `@Valid` cuando corresponda.
- No deben contener lógica de negocio.

### Services

- Deben contener la lógica de negocio.
- Deben manejar transacciones con `@Transactional` cuando modifiquen datos.
- Deben lanzar excepciones de dominio claras.
- No deben depender de detalles HTTP como `ResponseEntity`.

### Repositories

- Deben extender interfaces de Spring Data JPA.
- Deben contener consultas de persistencia, no lógica de negocio.
- Los nombres de métodos deben ser claros y representar la consulta realizada.

### DTOs y validación

- Los DTOs de entrada deben validar campos obligatorios con Bean Validation.
- Los DTOs de salida deben exponer solo la información necesaria para el cliente.
- No reutilizar entidades JPA como DTOs.

### Manejo de errores

- Usar excepciones específicas para errores de dominio.
- Centralizar la conversión de excepciones a respuestas HTTP en un handler global.
- Mantener un formato consistente para errores de API.

### Migraciones Flyway

- Las migraciones deben ubicarse en `backend/src/main/resources/db/migration`.
- El formato debe ser `V<numero>__<descripcion>.sql`.
- Usar nombres de tablas y columnas en `snake_case`.
- No modificar migraciones ya aplicadas; crear una nueva migración para cambios posteriores.

## Base de datos

- Tablas y columnas en `snake_case`.
- Claves primarias con nombre `id` salvo que exista una razón clara para otro nombre.
- Fechas de creación con `created_at`.
- Fechas de actualización con `updated_at` cuando aplique.
- Estados representados con enums o valores controlados.
- Relaciones con foreign keys explícitas.

## API REST

- Usar sustantivos en plural para recursos: `/api/customers`, `/api/accounts`.
- Usar métodos HTTP según la operación:
  - `GET` para consulta.
  - `POST` para creación o acciones no idempotentes.
  - `PUT` para reemplazo completo.
  - `PATCH` para actualización parcial.
  - `DELETE` para eliminación.
- Versionar la API bajo `/api/v1` cuando se creen endpoints reales.
- Responder con códigos HTTP adecuados.

## Frontend React / TypeScript

Cuando se implemente el frontend:

- Usar componentes funcionales.
- Usar TypeScript estricto siempre que sea posible.
- Separar componentes de UI, hooks, servicios de API y schemas de validación.
- Usar TanStack Query para datos de servidor.
- Usar React Hook Form y Zod para formularios y validaciones.
- Evitar lógica de negocio bancaria compleja en el frontend.

## Commits

Usar mensajes de commit cortos y descriptivos con prefijo semántico:

- `feat:` para nuevas funcionalidades.
- `fix:` para correcciones.
- `docs:` para documentación.
- `test:` para pruebas.
- `refactor:` para refactors sin cambio funcional.
- `chore:` para tareas de mantenimiento.

Ejemplos:

```text
feat: add customer creation endpoint
docs: define backend architecture
fix: validate transfer amount
```

## Testing

- Agregar tests unitarios para reglas de negocio.
- Agregar tests de integración para repositories y endpoints críticos.
- Priorizar tests en transferencias, saldos, ledger y seguridad.
- No considerar completo un cambio de negocio sin pruebas relevantes.
