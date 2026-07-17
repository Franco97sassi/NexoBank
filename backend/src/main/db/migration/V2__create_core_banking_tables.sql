CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT chk_users_role
        CHECK (role IN ('CUSTOMER', 'EMPLOYEE', 'ADMIN'))
);

CREATE TABLE customers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_number VARCHAR(20) NOT NULL UNIQUE,
    birth_date DATE,
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    cbu VARCHAR(22) NOT NULL UNIQUE,
    alias VARCHAR(30) NOT NULL UNIQUE,
    currency VARCHAR(3) NOT NULL,
    account_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    balance NUMERIC(19, 2) NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_accounts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT chk_accounts_type
        CHECK (account_type IN ('SAVINGS', 'CHECKING')),

    CONSTRAINT chk_accounts_status
        CHECK (status IN ('ACTIVE', 'BLOCKED', 'CLOSED')),

    CONSTRAINT chk_accounts_currency
        CHECK (currency IN ('ARS', 'USD')),

    CONSTRAINT chk_accounts_balance
        CHECK (balance >= 0)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    balance_after NUMERIC(19, 2) NOT NULL,
    reference_id UUID,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id),

    CONSTRAINT chk_transactions_type
        CHECK (
            type IN (
                'DEPOSIT',
                'WITHDRAWAL',
                'TRANSFER_IN',
                'TRANSFER_OUT'
            )
        ),

    CONSTRAINT chk_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT chk_transactions_balance_after
        CHECK (balance_after >= 0)
);

CREATE INDEX idx_accounts_customer_id
    ON accounts(customer_id);

CREATE INDEX idx_transactions_account_id
    ON transactions(account_id);

CREATE INDEX idx_transactions_created_at
    ON transactions(created_at);

CREATE INDEX idx_transactions_reference_id
    ON transactions(reference_id);