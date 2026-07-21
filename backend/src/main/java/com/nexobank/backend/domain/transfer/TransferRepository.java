package com.nexobank.backend.domain.transfer;

     import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

    public interface TransferRepository extends JpaRepository<Transfer, UUID> {

        Page<Transfer> findAllBySourceAccountId(UUID sourceAccountId, Pageable pageable);

        Optional<Transfer> findByIdempotencyKey(String idempotencyKey);
}
