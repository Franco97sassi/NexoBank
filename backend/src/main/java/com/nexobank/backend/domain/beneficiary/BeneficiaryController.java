package com.nexobank.backend.domain.beneficiary;

import com.nexobank.backend.domain.beneficiary.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/beneficiaries")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class BeneficiaryController {
    private final BeneficiaryService service;
    public BeneficiaryController(BeneficiaryService service) { this.service = service; }

    @GetMapping
    public BeneficiaryPageResponse findAll(@RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) String search, @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "displayName") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {
        return service.findAll(customerId, search, active, page, size, sortBy, direction);
    }
    @GetMapping("/{id}") public BeneficiaryResponse findById(@PathVariable UUID id) { return service.findById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse create(@Valid @RequestBody BeneficiaryRequest request) { return service.create(request); }
    @PutMapping("/{id}")
    public BeneficiaryResponse update(@PathVariable UUID id, @Valid @RequestBody BeneficiaryRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) { service.deactivate(id); }
}
