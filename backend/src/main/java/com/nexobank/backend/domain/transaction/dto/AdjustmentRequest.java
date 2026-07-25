package com.nexobank.backend.domain.transaction.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AdjustmentRequest(
        @NotNull @Digits(integer = 17, fraction = 2) BigDecimal amount,
        @NotNull @Size(min = 3, max = 255) String description) {
}
