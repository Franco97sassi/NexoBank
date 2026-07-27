package com.nexobank.backend.domain.transfer;

import com.nexobank.backend.common.model.BaseEntity;
import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.beneficiary.Beneficiary;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transfers")
public class Transfer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_account_id", nullable = false)
    private Account sourceAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_account_id")
    private Account destinationAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_id")
    private Beneficiary beneficiary;

    @Column(name = "destination_cbu", nullable = false, length = 22)
    private String destinationCbu;

    @Column(name = "destination_alias", length = 30)
    private String destinationAlias;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransferStatus status;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @Column(length = 255)
    private String description;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "executed_at")
    private Instant executedAt;

    protected Transfer() {
    }

    public Transfer(
            Account sourceAccount,
            Account destinationAccount,
            Beneficiary beneficiary,
            String destinationCbu,
            String destinationAlias,
            BigDecimal amount,
            String currency,
            String idempotencyKey,
            String description
    ) {
        this.sourceAccount = sourceAccount;
        this.destinationAccount = destinationAccount;
        this.beneficiary = beneficiary;
        this.destinationCbu = destinationCbu;
        this.destinationAlias = destinationAlias;
        this.amount = amount;
        this.currency = currency;
        this.idempotencyKey = idempotencyKey;
        this.description = description;
        this.status = TransferStatus.PENDING;
    }

    public Account getSourceAccount() {
        return sourceAccount;
    }

    public Account getDestinationAccount() {
        return destinationAccount;
    }

    public Beneficiary getBeneficiary() {
        return beneficiary;
    }

    public String getDestinationCbu() {
        return destinationCbu;
    }

    public String getDestinationAlias() {
        return destinationAlias;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getDescription() {
        return description;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void complete(Instant executedAt) {
        this.status = TransferStatus.COMPLETED;
        this.executedAt = executedAt;
        this.failureReason = null;
    }
}
