ALTER TABLE transactions DROP CONSTRAINT chk_transactions_type;
ALTER TABLE transactions ADD CONSTRAINT chk_transactions_type
    CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT'));
