package com.nexobank.backend.domain.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByCbu(String cbu);

    Optional<Account> findByAliasIgnoreCase(String alias);

    List<Account> findAllByCustomerId(UUID customerId);

    boolean existsByCbu(String cbu);

    boolean existsByAliasIgnoreCase(String alias);
}