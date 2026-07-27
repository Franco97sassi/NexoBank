package com.nexobank.backend.domain.transfer;

public class TransferConflictException extends RuntimeException {
    public TransferConflictException(String message) {
        super(message);
    }
}
