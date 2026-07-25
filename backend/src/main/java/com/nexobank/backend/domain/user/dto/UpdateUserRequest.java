package com.nexobank.backend.domain.user.dto;

import com.nexobank.backend.domain.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank @Email @Size(max = 150) String email,
        @Size(min = 8, max = 72) String password,
        @NotNull Role role,
        boolean enabled
) {
}
