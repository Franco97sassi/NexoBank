package com.nexobank.backend.domain.beneficiary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {

    List<Beneficiary> findAllByCustomerId(UUID customerId);

    List<Beneficiary> findAllByCustomerIdAndActiveTrue(UUID customerId);

    Optional<Beneficiary> findByCustomerIdAndCbu(UUID customerId, String cbu);

    boolean existsByCustomerIdAndCbu(UUID customerId, String cbu);
}
