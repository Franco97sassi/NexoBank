package com.nexobank.backend.domain.ledger;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    Page<LedgerEntry> findAllByAccountId(UUID accountId, Pageable pageable);

    Page<LedgerEntry> findAllByTransferId(UUID transferId, Pageable pageable);
}