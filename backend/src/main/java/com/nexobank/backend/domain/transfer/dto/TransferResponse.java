package com.nexobank.backend.domain.transfer.dto;

import com.nexobank.backend.domain.transfer.Transfer;
import com.nexobank.backend.domain.transfer.TransferStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransferResponse(
        UUID id, UUID sourceAccountId, String sourceCbu, UUID beneficiaryId,
        String beneficiaryName, String destinationCbu, String destinationAlias,
        BigDecimal amount, String currency, TransferStatus status,
        String idempotencyKey, String description, String failureReason,
        Instant executedAt, Instant createdAt
) {
    public static TransferResponse from(Transfer transfer) {
        return new TransferResponse(
                transfer.getId(), transfer.getSourceAccount().getId(), transfer.getSourceAccount().getCbu(),
                transfer.getBeneficiary() == null ? null : transfer.getBeneficiary().getId(),
                transfer.getBeneficiary() == null ? null : transfer.getBeneficiary().getDisplayName(),
                transfer.getDestinationCbu(), transfer.getDestinationAlias(), transfer.getAmount(),
                transfer.getCurrency(), transfer.getStatus(), transfer.getIdempotencyKey(),
                transfer.getDescription(), transfer.getFailureReason(), transfer.getExecutedAt(), transfer.getCreatedAt());
    }
}
