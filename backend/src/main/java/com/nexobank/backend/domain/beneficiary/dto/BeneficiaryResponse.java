package com.nexobank.backend.domain.beneficiary.dto;

import com.nexobank.backend.domain.beneficiary.Beneficiary;
import java.time.Instant;
import java.util.UUID;

public record BeneficiaryResponse(UUID id, UUID customerId, String customerName, String displayName,
                                  String cbu, String alias, String bankName, boolean active,
                                  boolean internal, Instant createdAt) {
    public static BeneficiaryResponse from(Beneficiary beneficiary) {
        return new BeneficiaryResponse(beneficiary.getId(), beneficiary.getCustomer().getId(),
                beneficiary.getCustomer().getFirstName() + " " + beneficiary.getCustomer().getLastName(),
                beneficiary.getDisplayName(), beneficiary.getCbu(), beneficiary.getAlias(),
                beneficiary.getBankName(), beneficiary.isActive(), beneficiary.getDestinationAccount() != null,
                beneficiary.getCreatedAt());
    }
}
