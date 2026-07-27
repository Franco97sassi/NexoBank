package com.nexobank.backend.domain.fraud.dto;
import com.nexobank.backend.domain.fraud.*;
import java.time.Instant;
import java.util.UUID;
public record FraudAlertResponse(UUID id, UUID transferId, UUID accountId, UUID customerId,
 String ruleCode, FraudAlertSeverity severity, FraudAlertStatus status, String description,
 String reviewedBy, Instant reviewedAt, Instant createdAt) {
 public static FraudAlertResponse from(FraudAlert a) { return new FraudAlertResponse(a.getId(),
  a.getTransfer()==null?null:a.getTransfer().getId(), a.getAccount()==null?null:a.getAccount().getId(),
  a.getCustomer()==null?null:a.getCustomer().getId(), a.getRuleCode(), a.getSeverity(), a.getStatus(),
  a.getDescription(), a.getReviewedByUser()==null?null:a.getReviewedByUser().getEmail(), a.getReviewedAt(), a.getCreatedAt()); }
}
