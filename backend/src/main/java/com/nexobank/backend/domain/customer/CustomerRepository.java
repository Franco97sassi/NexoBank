package com.nexobank.backend.domain.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CustomerRepository extends JpaRepository<Customer, UUID>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByDocumentNumber(String documentNumber);

    Optional<Customer> findByUserId(UUID userId);

    boolean existsByDocumentNumber(String documentNumber);

    boolean existsByUserId(UUID userId);
}