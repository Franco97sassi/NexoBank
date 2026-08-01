package com.nexobank.backend.domain.ledger;

public class LedgerConflictException extends RuntimeException {
    public LedgerConflictException(String message) {
        super(message);
    }
}
