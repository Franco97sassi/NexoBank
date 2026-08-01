package com.nexobank.backend.domain.ledger.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record LedgerEntryPageResponse(List<LedgerEntryResponse> content, int page, int size,
                                      long totalElements, int totalPages) {
    public static LedgerEntryPageResponse from(Page<LedgerEntryResponse> page) {
        return new LedgerEntryPageResponse(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
