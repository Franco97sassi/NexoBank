package com.nexobank.backend.domain.transfer;

     import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransferRepository extends JpaRepository<Transfer, UUID>, JpaSpecificationExecutor<Transfer> {

        Page<Transfer> findAllBySourceAccountId(UUID sourceAccountId, Pageable pageable);

        Optional<Transfer> findByIdempotencyKey(String idempotencyKey);

        long countByStatus(TransferStatus status);

        List<Transfer> findTop5ByOrderByCreatedAtDesc();

        @Query("select coalesce(sum(t.amount), 0) from Transfer t where t.status = :status")
        BigDecimal sumAmountsByStatus(TransferStatus status);
}
