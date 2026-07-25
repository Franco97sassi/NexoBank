package com.nexobank.backend.domain.beneficiary.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record BeneficiaryRequest(
        @NotNull UUID customerId,
        @NotBlank @Size(max = 120) String displayName,
        @NotBlank @Pattern(regexp = "\\d{22}", message = "must contain exactly 22 digits") String cbu,
        @Pattern(regexp = "^$|^[A-Za-z0-9.-]{6,30}$") String alias,
        @Size(max = 120) String bankName
) {}
