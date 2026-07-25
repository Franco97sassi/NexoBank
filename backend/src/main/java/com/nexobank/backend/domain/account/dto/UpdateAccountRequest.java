package com.nexobank.backend.domain.account.dto;

import com.nexobank.backend.domain.account.AccountStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdateAccountRequest(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9.]{6,30}", message = "must contain 6 to 30 letters, numbers or dots") String alias,
        @NotNull AccountStatus status
) {}
