package com.nexobank.backend.domain.customer.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record CustomerPageResponse(
        List<CustomerResponse> content, int page, int size, long totalElements, int totalPages
) {
    public static CustomerPageResponse from(Page<CustomerResponse> customers) {
        return new CustomerPageResponse(customers.getContent(), customers.getNumber(), customers.getSize(),
                customers.getTotalElements(), customers.getTotalPages());
    }
}
