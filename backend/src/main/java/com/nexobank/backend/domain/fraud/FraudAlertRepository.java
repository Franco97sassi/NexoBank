package com.nexobank.backend.domain.fraud;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, UUID>, JpaSpecificationExecutor<FraudAlert> {

    Page<FraudAlert> findAllByStatus(FraudAlertStatus status, Pageable pageable);

    Page<FraudAlert> findAllByTransferId(UUID transferId, Pageable pageable);

    Page<FraudAlert> findAllByCustomerId(UUID customerId, Pageable pageable);
}
