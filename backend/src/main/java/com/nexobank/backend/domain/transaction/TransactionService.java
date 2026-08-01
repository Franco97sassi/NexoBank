package com.nexobank.backend.domain.transaction;

import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.account.AccountStatus;
import com.nexobank.backend.domain.ledger.LedgerEntryType;
import com.nexobank.backend.domain.ledger.LedgerService;
import com.nexobank.backend.domain.transaction.dto.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final LedgerService ledgerService;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository,
                              LedgerService ledgerService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.ledgerService = ledgerService;
    }

    @Transactional(readOnly = true)
    public TransactionPageResponse findAll(UUID accountId, TransactionType type, Instant from, Instant to,
                                           int page, int size, String sortBy, Sort.Direction direction) {
        String safeSort = switch (sortBy) {
            case "type", "amount", "balanceAfter", "createdAt" -> sortBy;
            default -> "createdAt";
        };
        Specification<Transaction> specification = (root, query, builder) -> builder.conjunction();
        if (accountId != null) specification = specification.and((root, query, cb) -> cb.equal(root.get("account").get("id"), accountId));
        if (type != null) specification = specification.and((root, query, cb) -> cb.equal(root.get("type"), type));
        if (from != null) specification = specification.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        if (to != null) specification = specification.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        return TransactionPageResponse.from(transactionRepository.findAll(specification,
                PageRequest.of(page, size, Sort.by(direction, safeSort))).map(TransactionResponse::from));
    }

    @Transactional
    public TransactionResponse deposit(UUID accountId, MovementRequest request) {
        return apply(accountId, request.amount(), TransactionType.DEPOSIT, request.description());
    }
    @Transactional
    public TransactionResponse withdraw(UUID accountId, MovementRequest request) {
        return apply(accountId, request.amount().negate(), TransactionType.WITHDRAWAL, request.description());
    }
    @Transactional
    public TransactionResponse adjust(UUID accountId, AdjustmentRequest request) {
        if (request.amount().signum() == 0) throw new TransactionConflictException("Adjustment amount cannot be zero");
        return apply(accountId, request.amount(), TransactionType.ADJUSTMENT, request.description());
    }

    private TransactionResponse apply(UUID accountId, BigDecimal delta, TransactionType type, String description) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (account.getStatus() != AccountStatus.ACTIVE) throw new TransactionConflictException("Account must be active");
        BigDecimal newBalance = account.getBalance().add(delta);
        if (newBalance.signum() < 0) throw new TransactionConflictException("Insufficient funds");
        account.changeBalance(newBalance);
        String effectiveDescription = description == null || description.isBlank()
                ? defaultDescription(type) : description.trim();
        Transaction movement = transactionRepository.save(new Transaction(account, type, delta.abs(), newBalance, null,
                effectiveDescription));
        LedgerEntryType entryType = delta.signum() > 0 ? LedgerEntryType.CREDIT : LedgerEntryType.DEBIT;
        ledgerService.recordMovement(account, movement, entryType, delta.abs(), newBalance, effectiveDescription);
        return TransactionResponse.from(movement);
    }

    private String defaultDescription(TransactionType type) {
        return switch (type) {
            case DEPOSIT -> "Deposit";
            case WITHDRAWAL -> "Withdrawal";
            case ADJUSTMENT -> "Manual adjustment";
            default -> type.name();
        };
    }
}
