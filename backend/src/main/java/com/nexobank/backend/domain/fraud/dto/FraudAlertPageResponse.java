package com.nexobank.backend.domain.fraud.dto;
import org.springframework.data.domain.Page;
import java.util.List;
public record FraudAlertPageResponse(List<FraudAlertResponse> content, int page, int size, long totalElements, int totalPages) {
 public static FraudAlertPageResponse from(Page<FraudAlertResponse> p) { return new FraudAlertPageResponse(p.getContent(),p.getNumber(),p.getSize(),p.getTotalElements(),p.getTotalPages()); }
}
