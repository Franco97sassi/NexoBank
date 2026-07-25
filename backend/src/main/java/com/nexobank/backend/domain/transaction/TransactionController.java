package com.nexobank.backend.domain.transaction;

import com.nexobank.backend.domain.transaction.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class TransactionController {
    private final TransactionService service;
    public TransactionController(TransactionService service) { this.service = service; }

    @GetMapping
    public TransactionPageResponse findAll(@RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        return service.findAll(accountId, type, from, to, page, size, sortBy, direction);
    }
    @PostMapping("/accounts/{accountId}/deposits") @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse deposit(@PathVariable UUID accountId, @Valid @RequestBody MovementRequest request) {
        return service.deposit(accountId, request);
    }
    @PostMapping("/accounts/{accountId}/withdrawals") @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse withdraw(@PathVariable UUID accountId, @Valid @RequestBody MovementRequest request) {
        return service.withdraw(accountId, request);
    }
    @PostMapping("/accounts/{accountId}/adjustments") @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse adjust(@PathVariable UUID accountId, @Valid @RequestBody AdjustmentRequest request) {
        return service.adjust(accountId, request);
    }
}
