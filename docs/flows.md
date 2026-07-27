# Diagramas de arquitectura y flujos

## Contenedores en ejecución

```mermaid
flowchart LR
    U[Cliente u operador] -->|HTTPS| N[Nginx + SPA React]
    N -->|JSON / Bearer JWT| A[API Spring Boot]
    A -->|JPA / JDBC| P[(PostgreSQL)]
    A -->|OpenAPI| S[Swagger UI]
    subgraph API
      A --> SEC[Security]
      A --> DOM[Servicios de dominio]
      DOM --> AUD[Auditoría]
      DOM --> FRA[Reglas de fraude]
    end
```

## Login y renovación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as React
    participant A as AuthController
    participant DB as PostgreSQL
    U->>W: email y contraseña
    W->>A: POST /auth/login
    A->>DB: valida usuario y hash
    A->>DB: persiste refresh token
    A-->>W: access token + refresh token
    W->>A: request + Bearer access token
    A-->>W: recurso protegido
    Note over W,A: al vencer el access token
    W->>A: POST /auth/refresh
    A->>DB: valida y rota refresh token
    A-->>W: nueva sesión
```

## Transferencia interna

```mermaid
sequenceDiagram
    actor C as Cliente
    participant W as React
    participant T as TransferService
    participant F as FraudAlertService
    participant DB as PostgreSQL
    C->>W: confirma importe y destinatario
    W->>T: POST /transfers + idempotencyKey
    T->>DB: busca clave idempotente
    alt solicitud ya procesada
        DB-->>T: transferencia existente
        T-->>W: mismo resultado, sin segundo débito
    else solicitud nueva
        T->>DB: valida cuentas, moneda, estado y saldo
        T->>DB: actualiza saldos
        T->>DB: crea transferencia, movimientos y ledger
        T->>F: evalúa reglas
        F->>DB: crea alertas aplicables
        T-->>W: transferencia completada
    end
    W->>T: GET /transfers/{id}/receipt
    T-->>W: comprobante inmutable
```

La modificación de saldos y la creación de registros asociados comparten una transacción de base de datos. Un
error provoca rollback. El control optimista evita que dos escrituras concurrentes sobrescriban el mismo saldo.

## Auditoría y revisión de fraude

```mermaid
flowchart TD
    R[Request autenticado] --> I[Interceptor captura IP y user-agent]
    I --> C[Controller autorizado]
    C --> S[Servicio ejecuta caso de uso]
    S --> E[(audit_events)]
    S --> Q{Regla de fraude coincide?}
    Q -->|Sí| F[(fraud_alerts OPEN)]
    Q -->|No| X[Finaliza]
    F --> D[Dashboard administrativo]
    D --> V[Admin revisa alerta]
    V --> U[UNDER_REVIEW / DISMISSED / CONFIRMED]
    V --> E
```

## Despliegue con Compose

```mermaid
flowchart TB
    H[Host Docker]
    subgraph H
      FE[frontend :5173 -> Nginx :80]
      BE[backend :8080]
      PG[(postgres :5432)]
      VOL[(postgres_data)]
      FE --> BE
      BE --> PG
      PG --- VOL
    end
    B[Browser] -->|localhost:5173| FE
    B -->|localhost:8080| BE
    DEV[Herramientas locales] -->|localhost:5434| PG
```

Compose espera que el healthcheck de PostgreSQL pase antes de iniciar el backend. Para producción, reemplace los
puertos públicos por una red privada, termine HTTPS en un proxy/ingress y use credenciales externas al repositorio.
