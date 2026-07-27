package com.nexobank.backend.domain.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID>, JpaSpecificationExecutor<Account> {
    Optional<Account> findByCbu(String cbu);

    Optional<Account> findByAliasIgnoreCase(String alias);

    List<Account> findAllByCustomerId(UUID customerId);

    boolean existsByCbu(String cbu);

    boolean existsByAliasIgnoreCase(String alias);

    long countByStatus(AccountStatus status);

    @Query("select coalesce(sum(a.balance), 0) from Account a where a.status = :status")
    BigDecimal sumBalancesByStatus(AccountStatus status);
}
