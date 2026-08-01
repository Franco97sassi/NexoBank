ALTER TABLE ledger_entries
    ALTER COLUMN account_id DROP NOT NULL,
    ALTER COLUMN balance_after DROP NOT NULL,
    ADD COLUMN journal_id UUID,
    ADD COLUMN account_code VARCHAR(100);

UPDATE ledger_entries
SET journal_id = COALESCE(transfer_id, id),
    account_code = 'CUSTOMER:' || account_id::text;

ALTER TABLE ledger_entries
    ALTER COLUMN journal_id SET NOT NULL,
    ALTER COLUMN account_code SET NOT NULL;

CREATE INDEX idx_ledger_entries_journal_id ON ledger_entries(journal_id);
CREATE INDEX idx_ledger_entries_account_code ON ledger_entries(account_code);
