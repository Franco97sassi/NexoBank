package com.nexobank.backend.domain.transaction.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record TransactionPageResponse(List<TransactionResponse> content, int page, int size,
                                      long totalElements, int totalPages) {
    public static TransactionPageResponse from(Page<TransactionResponse> page) {
        return new TransactionPageResponse(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
