package com.nexobank.backend.domain.beneficiary.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record BeneficiaryPageResponse(List<BeneficiaryResponse> content, int page, int size,
                                      long totalElements, int totalPages) {
    public static BeneficiaryPageResponse from(Page<BeneficiaryResponse> result) {
        return new BeneficiaryPageResponse(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }
}
