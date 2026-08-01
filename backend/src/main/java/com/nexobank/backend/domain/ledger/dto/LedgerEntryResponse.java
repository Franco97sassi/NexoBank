package com.nexobank.backend.domain.ledger.dto;

import com.nexobank.backend.domain.ledger.LedgerEntry;
import com.nexobank.backend.domain.ledger.LedgerEntryType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LedgerEntryResponse(UUID id, UUID journalId, String accountCode, UUID accountId, UUID transferId,
                                  UUID transactionId, LedgerEntryType entryType, BigDecimal amount, String currency,
                                  BigDecimal balanceAfter, String description, Instant createdAt) {
    public static LedgerEntryResponse from(LedgerEntry entry) {
        return new LedgerEntryResponse(entry.getId(), entry.getJournalId(), entry.getAccountCode(),
                entry.getAccount() == null ? null : entry.getAccount().getId(),
                entry.getTransfer() == null ? null : entry.getTransfer().getId(),
                entry.getTransaction() == null ? null : entry.getTransaction().getId(), entry.getEntryType(),
                entry.getAmount(), entry.getCurrency(), entry.getBalanceAfter(), entry.getDescription(),
                entry.getCreatedAt());
    }
}
