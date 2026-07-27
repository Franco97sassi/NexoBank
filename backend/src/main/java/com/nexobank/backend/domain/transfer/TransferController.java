package com.nexobank.backend.domain.transfer;

import com.nexobank.backend.domain.transfer.dto.CreateTransferRequest;
import com.nexobank.backend.domain.transfer.dto.TransferPageResponse;
import com.nexobank.backend.domain.transfer.dto.TransferResponse;
import com.nexobank.backend.domain.transfer.dto.TransferReceiptResponse;
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
@RequestMapping("/api/v1/transfers")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class TransferController {
    private final TransferService service;
    public TransferController(TransferService service) { this.service = service; }

    @GetMapping
    public TransferPageResponse findAll(@RequestParam(required = false) UUID accountId,
                                        @RequestParam(required = false) TransferStatus status,
                                        @RequestParam(defaultValue = "0") @Min(0) int page,
                                        @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
                                        @RequestParam(defaultValue = "createdAt") String sortBy,
                                        @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        return service.findAll(accountId, status, page, size, sortBy, direction);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse create(@Valid @RequestBody CreateTransferRequest request) {
        return service.create(request);
    }

    @GetMapping("/{transferId}/receipt")
    public TransferReceiptResponse getReceipt(@PathVariable UUID transferId) {
        return service.getReceipt(transferId);
    }
}
