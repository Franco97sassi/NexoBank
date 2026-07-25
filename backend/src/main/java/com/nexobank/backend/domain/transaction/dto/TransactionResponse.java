package com.nexobank.backend.domain.transaction.dto;

import com.nexobank.backend.domain.transaction.Transaction;
import com.nexobank.backend.domain.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(UUID id, UUID accountId, String accountAlias, TransactionType type,
                                  BigDecimal amount, BigDecimal balanceAfter, UUID referenceId,
                                  String description, Instant createdAt) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(transaction.getId(), transaction.getAccount().getId(),
                transaction.getAccount().getAlias(), transaction.getType(), transaction.getAmount(),
                transaction.getBalanceAfter(), transaction.getReferenceId(), transaction.getDescription(),
                transaction.getCreatedAt());
    }
}
