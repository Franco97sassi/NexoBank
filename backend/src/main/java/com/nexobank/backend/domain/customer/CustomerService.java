package com.nexobank.backend.domain.customer;

import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.customer.dto.CustomerPageResponse;
import com.nexobank.backend.domain.customer.dto.CustomerRequest;
import com.nexobank.backend.domain.customer.dto.CustomerResponse;
import com.nexobank.backend.domain.user.Role;
import com.nexobank.backend.domain.user.User;
import com.nexobank.backend.domain.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CustomerPageResponse findAll(String search, int page, int size, String sortBy, Sort.Direction direction) {
        String safeSort = switch (sortBy) {
            case "firstName", "lastName", "documentNumber", "birthDate" -> sortBy;
            default -> "lastName";
        };
        Specification<Customer> specification = (root, query, builder) -> {
            if (search == null || search.isBlank()) {
                return builder.conjunction();
            }
            String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return builder.or(
                    builder.like(builder.lower(root.get("firstName")), term),
                    builder.like(builder.lower(root.get("lastName")), term),
                    builder.like(builder.lower(root.get("documentNumber")), term),
                    builder.like(builder.lower(root.get("user").get("email")), term)
            );
        };
        return CustomerPageResponse.from(customerRepository.findAll(specification,
                PageRequest.of(page, size, Sort.by(direction, safeSort))).map(CustomerResponse::from));
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(UUID id) {
        return CustomerResponse.from(findCustomer(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        User user = findCustomerUser(request.userId());
        ensureUnique(request, null);
        Customer customer = new Customer(user, clean(request.firstName()), clean(request.lastName()),
                normalizeDocument(request.documentNumber()), request.birthDate(), optional(request.phone()));
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        User user = findCustomerUser(request.userId());
        ensureUnique(request, id);
        customer.update(user, clean(request.firstName()), clean(request.lastName()),
                normalizeDocument(request.documentNumber()), request.birthDate(), optional(request.phone()));
        return CustomerResponse.from(customer);
    }

    @Transactional
    public void delete(UUID id) {
        customerRepository.delete(findCustomer(id));
    }

    private Customer findCustomer(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private User findCustomerUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != Role.CUSTOMER) {
            throw new CustomerConflictException("User must have CUSTOMER role");
        }
        return user;
    }

    private void ensureUnique(CustomerRequest request, UUID customerId) {
        customerRepository.findByDocumentNumber(normalizeDocument(request.documentNumber()))
                .filter(customer -> !customer.getId().equals(customerId))
                .ifPresent(customer -> {
                    throw new CustomerConflictException("Document number is already registered");
                });
        customerRepository.findByUserId(request.userId())
                .filter(customer -> !customer.getId().equals(customerId))
                .ifPresent(customer -> { throw new CustomerConflictException("User is already linked to a customer"); });
    }

    private String clean(String value) {
        return value.trim();
    }

    private String normalizeDocument(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String optional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
