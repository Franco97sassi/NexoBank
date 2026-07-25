package com.nexobank.backend.domain.customer.dto;

import com.nexobank.backend.domain.customer.Customer;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        UUID userId,
        String userEmail,
        String firstName,
        String lastName,
        String documentNumber,
        LocalDate birthDate,
        String phone,
        Instant createdAt,
        Instant updatedAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getUser().getId(),
                customer.getUser().getEmail(), customer.getFirstName(), customer.getLastName(),
                customer.getDocumentNumber(), customer.getBirthDate(), customer.getPhone(),
                customer.getCreatedAt(), customer.getUpdatedAt());
    }
}
