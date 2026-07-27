package com.nexobank.backend.domain.fraud.dto;
import com.nexobank.backend.domain.fraud.FraudAlertStatus;
import jakarta.validation.constraints.NotNull;
public record ReviewFraudAlertRequest(@NotNull FraudAlertStatus status) {}
