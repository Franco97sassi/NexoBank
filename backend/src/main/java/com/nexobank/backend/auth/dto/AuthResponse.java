package com.nexobank.backend.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record AuthResponse(
        String accessToken,
        @JsonIgnore String refreshToken,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {
}
