package com.nexobank.backend.domain.account.dto;

import com.nexobank.backend.domain.account.AccountType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record CreateAccountRequest(
        @NotNull UUID customerId,
        @NotNull AccountType accountType,
        @NotNull @Pattern(regexp = "ARS|USD", message = "must be ARS or USD") String currency,
        @Pattern(regexp = "[A-Za-z0-9.]{6,30}", message = "must contain 6 to 30 letters, numbers or dots") String alias
) {}
