package com.nexobank.backend.domain.account;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import com.nexobank.backend.domain.account.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/accounts")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AccountController {
    private final AccountService service;
    public AccountController(AccountService service) { this.service = service; }

    @GetMapping
    public AccountPageResponse findAll(@RequestParam(required = false) String search,
                                       @RequestParam(defaultValue = "0") @Min(0) int page,
                                       @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
                                       @RequestParam(defaultValue = "createdAt") String sortBy,
                                       @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        return service.findAll(search, page, size, sortBy, direction);
    }
    @GetMapping("/{id}") public AccountResponse findById(@PathVariable UUID id) { return service.findById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse create(@Valid @RequestBody CreateAccountRequest request) { return service.create(request); }
    @PutMapping("/{id}")
    public AccountResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateAccountRequest request) {
        return service.update(id, request);
    }
}
