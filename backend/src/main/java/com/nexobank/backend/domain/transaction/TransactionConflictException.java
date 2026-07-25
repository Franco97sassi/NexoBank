package com.nexobank.backend.domain.transaction;

public class TransactionConflictException extends RuntimeException {
    public TransactionConflictException(String message) { super(message); }
}
