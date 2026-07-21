CREATE TABLE roles (
    name VARCHAR(30) PRIMARY KEY,
    description VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_roles_name
        CHECK (name IN ('CUSTOMER', 'EMPLOYEE', 'ADMIN'))
);

INSERT INTO roles (name, description)
VALUES
    ('CUSTOMER', 'Cliente bancario'),
    ('EMPLOYEE', 'Empleado bancario'),
    ('ADMIN', 'Administrador del sistema');

ALTER TABLE users
    ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role)
        REFERENCES roles(name);

CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    destination_account_id UUID,
    display_name VARCHAR(120) NOT NULL,
    cbu VARCHAR(22) NOT NULL,
    alias VARCHAR(30),
    bank_name VARCHAR(120),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_beneficiaries_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_beneficiaries_destination_account
        FOREIGN KEY (destination_account_id)
        REFERENCES accounts(id),

    CONSTRAINT chk_beneficiaries_cbu_length
        CHECK (char_length(cbu) = 22),

    CONSTRAINT uk_beneficiaries_customer_cbu
        UNIQUE (customer_id, cbu)
);

CREATE TABLE transfers (
    id UUID PRIMARY KEY,
    source_account_id UUID NOT NULL,
    destination_account_id UUID,
    beneficiary_id UUID,
    destination_cbu VARCHAR(22) NOT NULL,
    destination_alias VARCHAR(30),
    amount NUMERIC(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(30) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    failure_reason VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_transfers_source_account
        FOREIGN KEY (source_account_id)
        REFERENCES accounts(id),

    CONSTRAINT fk_transfers_destination_account
        FOREIGN KEY (destination_account_id)
        REFERENCES accounts(id),

    CONSTRAINT fk_transfers_beneficiary
        FOREIGN KEY (beneficiary_id)
        REFERENCES beneficiaries(id),

    CONSTRAINT chk_transfers_amount
        CHECK (amount > 0),

    CONSTRAINT chk_transfers_currency
        CHECK (currency IN ('ARS', 'USD')),

    CONSTRAINT chk_transfers_status
        CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED', 'FAILED', 'CANCELLED')),

    CONSTRAINT chk_transfers_destination_cbu_length
        CHECK (char_length(destination_cbu) = 22)
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    transfer_id UUID,
    transaction_id UUID,
    entry_type VARCHAR(30) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    balance_after NUMERIC(19, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_ledger_entries_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id),

    CONSTRAINT fk_ledger_entries_transfer
        FOREIGN KEY (transfer_id)
        REFERENCES transfers(id),

    CONSTRAINT fk_ledger_entries_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id),

    CONSTRAINT chk_ledger_entries_type
        CHECK (entry_type IN ('DEBIT', 'CREDIT')),

    CONSTRAINT chk_ledger_entries_amount
        CHECK (amount > 0),

    CONSTRAINT chk_ledger_entries_currency
        CHECK (currency IN ('ARS', 'USD')),

    CONSTRAINT chk_ledger_entries_balance_after
        CHECK (balance_after >= 0)
);

CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    actor_user_id UUID,
    event_type VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_audit_events_actor_user
        FOREIGN KEY (actor_user_id)
        REFERENCES users(id)
);

CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY,
    transfer_id UUID,
    account_id UUID,
    customer_id UUID,
    rule_code VARCHAR(80) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    reviewed_by_user_id UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_fraud_alerts_transfer
        FOREIGN KEY (transfer_id)
        REFERENCES transfers(id),

    CONSTRAINT fk_fraud_alerts_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id),

    CONSTRAINT fk_fraud_alerts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_fraud_alerts_reviewed_by_user
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(id),

    CONSTRAINT chk_fraud_alerts_severity
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    CONSTRAINT chk_fraud_alerts_status
        CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'DISMISSED', 'CONFIRMED'))
);

CREATE INDEX idx_beneficiaries_customer_id
    ON beneficiaries(customer_id);

CREATE INDEX idx_beneficiaries_destination_account_id
    ON beneficiaries(destination_account_id);

CREATE INDEX idx_transfers_source_account_id
    ON transfers(source_account_id);

CREATE INDEX idx_transfers_destination_account_id
    ON transfers(destination_account_id);

CREATE INDEX idx_transfers_beneficiary_id
    ON transfers(beneficiary_id);

CREATE INDEX idx_transfers_status
    ON transfers(status);

CREATE INDEX idx_transfers_created_at
    ON transfers(created_at);

CREATE INDEX idx_ledger_entries_account_id
    ON ledger_entries(account_id);

CREATE INDEX idx_ledger_entries_transfer_id
    ON ledger_entries(transfer_id);

CREATE INDEX idx_ledger_entries_transaction_id
    ON ledger_entries(transaction_id);

CREATE INDEX idx_ledger_entries_created_at
    ON ledger_entries(created_at);

CREATE INDEX idx_audit_events_actor_user_id
    ON audit_events(actor_user_id);

CREATE INDEX idx_audit_events_entity
    ON audit_events(entity_type, entity_id);

CREATE INDEX idx_audit_events_event_type
    ON audit_events(event_type);

CREATE INDEX idx_audit_events_created_at
    ON audit_events(created_at);

CREATE INDEX idx_fraud_alerts_transfer_id
    ON fraud_alerts(transfer_id);

CREATE INDEX idx_fraud_alerts_account_id
    ON fraud_alerts(account_id);

CREATE INDEX idx_fraud_alerts_customer_id
    ON fraud_alerts(customer_id);

CREATE INDEX idx_fraud_alerts_status
    ON fraud_alerts(status);
