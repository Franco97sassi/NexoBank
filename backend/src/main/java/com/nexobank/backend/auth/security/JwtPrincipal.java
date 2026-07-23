package com.nexobank.backend.auth.security;

import com.nexobank.backend.domain.user.Role;

import java.util.UUID;

public record JwtPrincipal(UUID userId, String email, Role role) {
}