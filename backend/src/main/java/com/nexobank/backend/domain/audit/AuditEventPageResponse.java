package com.nexobank.backend.domain.audit;

import org.springframework.data.domain.Page;
import java.util.List;

public record AuditEventPageResponse(
        List<AuditEventResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static AuditEventPageResponse from(Page<AuditEventResponse> result) {
        return new AuditEventPageResponse(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }
}
