package com.nexobank.backend.domain.account.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record AccountPageResponse(List<AccountResponse> content, int page, int size,
                                  long totalElements, int totalPages) {
    public static AccountPageResponse from(Page<AccountResponse> result) {
        return new AccountPageResponse(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }
}
