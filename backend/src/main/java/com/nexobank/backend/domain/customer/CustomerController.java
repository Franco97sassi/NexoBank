package com.nexobank.backend.domain.customer;

import com.nexobank.backend.domain.customer.dto.CustomerPageResponse;
import com.nexobank.backend.domain.customer.dto.CustomerRequest;
import com.nexobank.backend.domain.customer.dto.CustomerResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) { this.customerService = customerService; }

    @GetMapping
    public CustomerPageResponse findAll(@RequestParam(required = false) String search,
                                        @RequestParam(defaultValue = "0") @Min(0) int page,
                                        @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
                                        @RequestParam(defaultValue = "lastName") String sortBy,
                                        @RequestParam(defaultValue = "ASC") Sort.Direction direction) {
        return customerService.findAll(search, page, size, sortBy, direction);
    }

    @GetMapping("/{id}")
    public CustomerResponse findById(@PathVariable UUID id) { return customerService.findById(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) { return customerService.create(request); }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable UUID id, @Valid @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) { customerService.delete(id); }
}
