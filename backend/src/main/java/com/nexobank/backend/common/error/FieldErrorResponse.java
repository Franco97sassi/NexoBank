package com.nexobank.backend.common.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}
