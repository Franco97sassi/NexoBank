package com.nexobank.backend.domain.account.dto;

import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.account.AccountStatus;
import com.nexobank.backend.domain.account.AccountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountResponse(UUID id, UUID customerId, String customerName, String customerDocument,
                              String cbu, String alias, String currency, AccountType accountType,
                              AccountStatus status, BigDecimal balance, Instant createdAt, Instant updatedAt) {
    public static AccountResponse from(Account account) {
        var customer = account.getCustomer();
        return new AccountResponse(account.getId(), customer.getId(),
                customer.getFirstName() + " " + customer.getLastName(), customer.getDocumentNumber(),
                account.getCbu(), account.getAlias(), account.getCurrency(), account.getAccountType(),
                account.getStatus(), account.getBalance(), account.getCreatedAt(), account.getUpdatedAt());
    }
}
