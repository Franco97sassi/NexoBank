package com.nexobank.backend.domain.beneficiary;

import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.account.*;
import com.nexobank.backend.domain.beneficiary.dto.*;
import com.nexobank.backend.domain.customer.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class BeneficiaryService {
    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository, CustomerRepository customerRepository,
                              AccountRepository accountRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public BeneficiaryPageResponse findAll(UUID customerId, String search, Boolean active, int page, int size,
                                           String sortBy, Sort.Direction direction) {
        String safeSort = switch (sortBy) {
            case "displayName", "cbu", "bankName", "createdAt" -> sortBy;
            default -> "displayName";
        };
        Specification<Beneficiary> specification = (root, query, cb) -> cb.conjunction();
        if (customerId != null) specification = specification.and((root, query, cb) -> cb.equal(root.get("customer").get("id"), customerId));
        if (active != null) specification = specification.and((root, query, cb) -> cb.equal(root.get("active"), active));
        if (search != null && !search.isBlank()) {
            String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("displayName")), term), cb.like(cb.lower(root.get("cbu")), term),
                    cb.like(cb.lower(root.get("alias")), term), cb.like(cb.lower(root.get("bankName")), term)));
        }
        return BeneficiaryPageResponse.from(beneficiaryRepository.findAll(specification,
                PageRequest.of(page, size, Sort.by(direction, safeSort))).map(BeneficiaryResponse::from));
    }

    @Transactional(readOnly = true)
    public BeneficiaryResponse findById(UUID id) { return BeneficiaryResponse.from(findBeneficiary(id)); }

    @Transactional
    public BeneficiaryResponse create(BeneficiaryRequest request) {
        Customer customer = findCustomer(request.customerId());
        String cbu = request.cbu().trim();
        ensureUnique(request.customerId(), cbu, null);
        Account destination = accountRepository.findByCbu(cbu).orElse(null);
        Beneficiary beneficiary = new Beneficiary(customer, destination, clean(request.displayName()), cbu,
                optional(request.alias()), optional(request.bankName()));
        return BeneficiaryResponse.from(beneficiaryRepository.save(beneficiary));
    }

    @Transactional
    public BeneficiaryResponse update(UUID id, BeneficiaryRequest request) {
        Beneficiary beneficiary = findBeneficiary(id);
        if (!beneficiary.getCustomer().getId().equals(request.customerId()))
            throw new BeneficiaryConflictException("A beneficiary cannot be moved to another customer");
        String cbu = request.cbu().trim();
        ensureUnique(request.customerId(), cbu, id);
        beneficiary.update(accountRepository.findByCbu(cbu).orElse(null), clean(request.displayName()), cbu,
                optional(request.alias()), optional(request.bankName()));
        return BeneficiaryResponse.from(beneficiary);
    }

    @Transactional
    public void deactivate(UUID id) { findBeneficiary(id).deactivate(); }

    private Beneficiary findBeneficiary(UUID id) {
        return beneficiaryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
    }
    private Customer findCustomer(UUID id) {
        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }
    private void ensureUnique(UUID customerId, String cbu, UUID currentId) {
        beneficiaryRepository.findByCustomerIdAndCbu(customerId, cbu)
                .filter(item -> currentId == null || !currentId.equals(item.getId())).ifPresent(item -> {
                    throw new BeneficiaryConflictException("CBU is already registered for this customer");
                });
    }
    private String clean(String value) { return value.trim(); }
    private String optional(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
