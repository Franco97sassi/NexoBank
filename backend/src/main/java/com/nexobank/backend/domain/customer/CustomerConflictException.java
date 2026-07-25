package com.nexobank.backend.domain.customer;

public class CustomerConflictException extends RuntimeException {
    public CustomerConflictException(String message) {
        super(message);
    }
}
