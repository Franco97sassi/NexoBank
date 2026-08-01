package com.nexobank.backend.domain.ledger;

import com.nexobank.backend.domain.ledger.dto.LedgerEntryPageResponse;
import com.nexobank.backend.domain.ledger.dto.LedgerEntryResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/ledger")
@PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
public class LedgerController {
    private final LedgerService ledger;

    public LedgerController(LedgerService ledger) {
        this.ledger = ledger;
    }

    @GetMapping
    public LedgerEntryPageResponse findAll(@RequestParam(required = false) UUID accountId,
                                           @RequestParam(required = false) UUID transferId,
                                           @RequestParam(defaultValue = "0") @Min(0) int page,
                                           @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ledger.findAll(accountId, transferId, page, size);
    }

    @GetMapping("/journals/{journalId}")
    public List<LedgerEntryResponse> findJournal(@PathVariable UUID journalId) {
        return ledger.findJournal(journalId);
    }
}
