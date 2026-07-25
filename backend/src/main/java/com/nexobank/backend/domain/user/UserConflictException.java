package com.nexobank.backend.domain.user;

public class UserConflictException extends RuntimeException {

    public UserConflictException(String message) {
        super(message);
    }
}
