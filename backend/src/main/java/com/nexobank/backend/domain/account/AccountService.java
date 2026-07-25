package com.nexobank.backend.domain.account;

import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.account.dto.*;
import com.nexobank.backend.domain.customer.Customer;
import com.nexobank.backend.domain.customer.CustomerRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.UUID;

@Service
public class AccountService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;

    public AccountService(AccountRepository accountRepository, CustomerRepository customerRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public AccountPageResponse findAll(String search, int page, int size, String sortBy, Sort.Direction direction) {
        String safeSort = switch (sortBy) {
            case "cbu", "alias", "currency", "accountType", "status", "balance", "createdAt" -> sortBy;
            default -> "createdAt";
        };
        Specification<Account> specification = (root, query, builder) -> {
            if (search == null || search.isBlank()) return builder.conjunction();
            String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return builder.or(builder.like(builder.lower(root.get("cbu")), term),
                    builder.like(builder.lower(root.get("alias")), term),
                    builder.like(builder.lower(root.get("customer").get("firstName")), term),
                    builder.like(builder.lower(root.get("customer").get("lastName")), term),
                    builder.like(builder.lower(root.get("customer").get("documentNumber")), term));
        };
        return AccountPageResponse.from(accountRepository.findAll(specification,
                PageRequest.of(page, size, Sort.by(direction, safeSort))).map(AccountResponse::from));
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(UUID id) { return AccountResponse.from(findAccount(id)); }

    @Transactional
    public AccountResponse create(CreateAccountRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        String alias = request.alias() == null || request.alias().isBlank() ? generateAlias() : normalizeAlias(request.alias());
        ensureAliasAvailable(alias, null);
        Account account = new Account(customer, generateCbu(), alias,
                request.currency().toUpperCase(Locale.ROOT), request.accountType());
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(UUID id, UpdateAccountRequest request) {
        Account account = findAccount(id);
        String alias = normalizeAlias(request.alias());
        ensureAliasAvailable(alias, id);
        if (account.getStatus() == AccountStatus.CLOSED && request.status() != AccountStatus.CLOSED) {
            throw new AccountConflictException("A closed account cannot be reopened");
        }
        if (request.status() == AccountStatus.CLOSED && account.getBalance().signum() != 0) {
            throw new AccountConflictException("An account with a balance cannot be closed");
        }
        account.update(alias, request.status());
        return AccountResponse.from(account);
    }

    private Account findAccount(UUID id) {
        return accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }
    private void ensureAliasAvailable(String alias, UUID id) {
        accountRepository.findByAliasIgnoreCase(alias).filter(a -> !a.getId().equals(id)).ifPresent(a -> {
            throw new AccountConflictException("Alias is already registered");
        });
    }
    private String normalizeAlias(String alias) { return alias.trim().toLowerCase(Locale.ROOT); }
    private String generateAlias() {
        String alias;
        do alias = "nexo." + randomDigits(10); while (accountRepository.existsByAliasIgnoreCase(alias));
        return alias;
    }
    private String generateCbu() {
        String cbu;
        do cbu = "28505909" + randomDigits(14); while (accountRepository.existsByCbu(cbu));
        return cbu;
    }
    private String randomDigits(int length) {
        StringBuilder value = new StringBuilder(length);
        for (int i = 0; i < length; i++) value.append(RANDOM.nextInt(10));
        return value.toString();
    }
}
