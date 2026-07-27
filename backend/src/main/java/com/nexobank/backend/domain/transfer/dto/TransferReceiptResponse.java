package com.nexobank.backend.domain.transfer.dto;

import com.nexobank.backend.domain.transfer.Transfer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransferReceiptResponse(
        String receiptNumber,
        UUID transferId,
        Instant issuedAt,
        Instant executedAt,
        String sourceHolder,
        String sourceDocument,
        String sourceCbu,
        String destinationHolder,
        String destinationCbu,
        String destinationAlias,
        BigDecimal amount,
        String currency,
        String description
) {
    public static TransferReceiptResponse from(Transfer transfer) {
        var customer = transfer.getSourceAccount().getCustomer();
        return new TransferReceiptResponse(
                "NX-" + transfer.getId().toString().replace("-", "").substring(0, 12).toUpperCase(),
                transfer.getId(),
                transfer.getExecutedAt(),
                transfer.getExecutedAt(),
                customer.getFirstName() + " " + customer.getLastName(),
                customer.getDocumentNumber(),
                transfer.getSourceAccount().getCbu(),
                transfer.getBeneficiary() == null ? "Destinatario" : transfer.getBeneficiary().getDisplayName(),
                transfer.getDestinationCbu(),
                transfer.getDestinationAlias(),
                transfer.getAmount(),
                transfer.getCurrency(),
                transfer.getDescription()
        );
    }
}
