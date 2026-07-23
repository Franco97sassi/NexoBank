package com.nexobank.backend.auth.dto;

import com.nexobank.backend.domain.user.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        Role role,
        boolean enabled
) {
}