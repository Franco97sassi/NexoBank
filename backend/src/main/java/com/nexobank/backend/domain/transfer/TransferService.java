package com.nexobank.backend.domain.transfer;

import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.account.AccountStatus;
import com.nexobank.backend.domain.beneficiary.Beneficiary;
import com.nexobank.backend.domain.beneficiary.BeneficiaryRepository;
import com.nexobank.backend.domain.ledger.LedgerService;
import com.nexobank.backend.domain.fraud.FraudAlertService;
import com.nexobank.backend.domain.transaction.Transaction;
import com.nexobank.backend.domain.transaction.TransactionRepository;
import com.nexobank.backend.domain.transaction.TransactionType;
import com.nexobank.backend.domain.transfer.dto.CreateTransferRequest;
import com.nexobank.backend.domain.transfer.dto.TransferPageResponse;
import com.nexobank.backend.domain.transfer.dto.TransferReceiptResponse;
import com.nexobank.backend.domain.transfer.dto.TransferResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class TransferService {
    private final TransferRepository transfers;
    private final AccountRepository accounts;
    private final BeneficiaryRepository beneficiaries;
    private final TransactionRepository transactions;
    private final LedgerService ledger;
    private final FraudAlertService fraudAlerts;

    public TransferService(TransferRepository transfers, AccountRepository accounts,
                           BeneficiaryRepository beneficiaries, TransactionRepository transactions,
                           LedgerService ledger, FraudAlertService fraudAlerts) {
        this.transfers = transfers;
        this.accounts = accounts;
        this.beneficiaries = beneficiaries;
        this.transactions = transactions;
        this.ledger = ledger;
        this.fraudAlerts = fraudAlerts;
    }

    @Transactional(readOnly = true)
    public TransferPageResponse findAll(UUID accountId, TransferStatus status, int page, int size,
                                        String sortBy, Sort.Direction direction) {
        String safeSort = switch (sortBy) {
            case "amount", "status", "executedAt", "createdAt" -> sortBy;
            default -> "createdAt";
        };
        Specification<Transfer> spec = (root, query, cb) -> cb.conjunction();
        if (accountId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("sourceAccount").get("id"), accountId));
        if (status != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        return TransferPageResponse.from(transfers.findAll(spec,
                PageRequest.of(page, size, Sort.by(direction, safeSort))).map(TransferResponse::from));
    }

    @Transactional(readOnly = true)
    public TransferReceiptResponse getReceipt(UUID transferId) {
        Transfer transfer = transfers.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found"));
        if (transfer.getStatus() != TransferStatus.COMPLETED) {
            throw new TransferConflictException("A receipt is only available for completed transfers");
        }
        return TransferReceiptResponse.from(transfer);
    }

    @Transactional
    public TransferResponse create(CreateTransferRequest request) {
        var previous = transfers.findByIdempotencyKey(request.idempotencyKey().trim());
        if (previous.isPresent()) return TransferResponse.from(previous.get());

        Account source = accounts.findById(request.sourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));
        Beneficiary beneficiary = beneficiaries.findById(request.beneficiaryId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        validate(source, beneficiary, request.amount());
        Account destination = beneficiary.getDestinationAccount();
        String description = request.description() == null || request.description().isBlank()
                ? "Transfer to " + beneficiary.getDisplayName() : request.description().trim();
        Transfer transfer = transfers.save(new Transfer(source, destination, beneficiary, beneficiary.getCbu(),
                beneficiary.getAlias(), request.amount(), source.getCurrency(), request.idempotencyKey().trim(), description));

        BigDecimal sourceBalance = source.getBalance().subtract(request.amount());
        source.changeBalance(sourceBalance);
        transactions.save(new Transaction(source, TransactionType.TRANSFER_OUT, request.amount(),
                sourceBalance, transfer.getId(), description));
        BigDecimal destinationBalance = null;
        if (destination != null) {
            destinationBalance = destination.getBalance().add(request.amount());
            destination.changeBalance(destinationBalance);
            transactions.save(new Transaction(destination, TransactionType.TRANSFER_IN, request.amount(),
                    destinationBalance, transfer.getId(), description));
        }
        ledger.recordTransfer(source, destination, transfer, request.amount(), sourceBalance,
                destinationBalance, description);
        transfer.complete(Instant.now());
        fraudAlerts.evaluate(transfer);
        return TransferResponse.from(transfer);
    }

    private void validate(Account source, Beneficiary beneficiary, BigDecimal amount) {
        if (source.getStatus() != AccountStatus.ACTIVE) throw new TransferConflictException("Source account must be active");
        if (!beneficiary.isActive()) throw new TransferConflictException("Beneficiary must be active");
        if (!source.getCustomer().getId().equals(beneficiary.getCustomer().getId()))
            throw new TransferConflictException("Beneficiary does not belong to the source account customer");
        if (source.getCbu().equals(beneficiary.getCbu())) throw new TransferConflictException("Source and destination accounts must differ");
        if (source.getBalance().compareTo(amount) < 0) throw new TransferConflictException("Insufficient funds");
        if (beneficiary.getDestinationAccount() != null) {
            Account destination = beneficiary.getDestinationAccount();
            if (destination.getStatus() != AccountStatus.ACTIVE) throw new TransferConflictException("Destination account must be active");
            if (!source.getCurrency().equals(destination.getCurrency())) throw new TransferConflictException("Account currencies must match");
        }
    }
}
