# Modelo de datos y DER

Las migraciones de `backend/src/main/resources/db/migration` son la fuente de verdad. Este diagrama presenta las
relaciones funcionales; `system_health` se omite porque solo verifica la migración inicial.

```mermaid
erDiagram
    ROLES ||--o{ USERS : asigna
    USERS ||--o| CUSTOMERS : representa
    USERS ||--o{ AUDIT_EVENTS : ejecuta
    USERS ||--o{ FRAUD_ALERTS : revisa
    CUSTOMERS ||--o{ ACCOUNTS : posee
    CUSTOMERS ||--o{ BENEFICIARIES : registra
    CUSTOMERS ||--o{ FRAUD_ALERTS : genera
    ACCOUNTS ||--o{ TRANSACTIONS : contabiliza
    ACCOUNTS ||--o{ LEDGER_ENTRIES : recibe
    ACCOUNTS ||--o{ TRANSFERS : origina
    ACCOUNTS o|--o{ TRANSFERS : recibe
    ACCOUNTS o|--o{ BENEFICIARIES : identifica
    ACCOUNTS ||--o{ FRAUD_ALERTS : genera
    BENEFICIARIES ||--o{ TRANSFERS : destino
    TRANSFERS ||--o{ LEDGER_ENTRIES : respalda
    TRANSFERS ||--o{ FRAUD_ALERTS : dispara
    TRANSACTIONS o|--o{ LEDGER_ENTRIES : respalda

    ROLES {
        varchar name PK
        varchar description
    }
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar role FK
        boolean enabled
    }
    CUSTOMERS {
        uuid id PK
        uuid user_id FK,UK
        varchar document_number UK
        varchar first_name
        varchar last_name
    }
    ACCOUNTS {
        uuid id PK
        uuid customer_id FK
        varchar cbu UK
        varchar alias UK
        varchar currency
        varchar status
        numeric balance
        bigint version
    }
    BENEFICIARIES {
        uuid id PK
        uuid customer_id FK
        uuid destination_account_id FK
        varchar cbu
        varchar alias
        boolean active
    }
    TRANSFERS {
        uuid id PK
        uuid source_account_id FK
        uuid destination_account_id FK
        uuid beneficiary_id FK
        varchar idempotency_key UK
        numeric amount
        varchar status
    }
    TRANSACTIONS {
        uuid id PK
        uuid account_id FK
        varchar type
        numeric amount
        numeric balance_after
        uuid reference_id
    }
    LEDGER_ENTRIES {
        uuid id PK
        uuid account_id FK
        uuid transfer_id FK
        uuid transaction_id FK
        varchar entry_type
        numeric amount
        numeric balance_after
    }
    AUDIT_EVENTS {
        uuid id PK
        uuid actor_user_id FK
        varchar event_type
        varchar entity_type
        uuid entity_id
        jsonb metadata
    }
    FRAUD_ALERTS {
        uuid id PK
        uuid transfer_id FK
        uuid account_id FK
        uuid customer_id FK
        uuid reviewed_by_user_id FK
        varchar rule_code
        varchar severity
        varchar status
    }
```

## Reglas relevantes

- Email, documento, CBU y alias son únicos; un usuario solo puede vincularse a un cliente.
- El saldo y `balance_after` nunca son negativos; los importes ordinarios son mayores que cero.
- Cuentas y transferencias restringen moneda a `ARS` o `USD`.
- Una CBU tiene exactamente 22 caracteres y un cliente no duplica la CBU de un destinatario.
- La clave idempotente de transferencia es única en toda la plataforma.
- Las relaciones opcionales permiten registrar destinatarios externos y alertas no asociadas a una transferencia.
- Todas las entidades operativas conservan marcas temporales; auditoría añade metadatos JSONB, IP y user-agent.

## Evolución

No edite una migración que ya haya sido aplicada. Agregue una nueva `V<n>__descripcion.sql`, compruebe la
compatibilidad con datos existentes y deje que Hibernate valide el resultado al iniciar la aplicación.
