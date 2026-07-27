package com.nexobank.backend.domain.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminDashboardResponse(
        long users,
        long customers,
        long accounts,
        long activeAccounts,
        long blockedAccounts,
        BigDecimal totalActiveBalance,
        long transfers,
        long completedTransfers,
        long rejectedTransfers,
        BigDecimal completedTransferVolume,
        long transactions,
        List<RecentTransfer> recentTransfers
) {
    public record RecentTransfer(
            UUID id,
            String sourceCbu,
            String destinationCbu,
            BigDecimal amount,
            String currency,
            String status,
            Instant createdAt
    ) {
    }
}
