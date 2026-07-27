package com.nexobank.backend.domain.transfer.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record TransferPageResponse(List<TransferResponse> content, int page, int size,
                                   long totalElements, int totalPages) {
    public static TransferPageResponse from(Page<TransferResponse> page) {
        return new TransferPageResponse(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
