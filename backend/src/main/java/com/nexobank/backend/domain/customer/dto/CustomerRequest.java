package com.nexobank.backend.domain.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CustomerRequest(
        @NotNull UUID userId,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9.-]{5,20}") String documentNumber,
        @Past LocalDate birthDate,
        @Pattern(regexp = "^$|^[+0-9() -]{7,30}$") String phone
) {
}
