package com.nexobank.backend.domain.fraud;

import com.nexobank.backend.common.model.BaseEntity;
import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.customer.Customer;
import com.nexobank.backend.domain.transfer.Transfer;
import com.nexobank.backend.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "fraud_alerts")
public class FraudAlert extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id")
    private Transfer transfer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "rule_code", nullable = false, length = 80)
    private String ruleCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FraudAlertSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FraudAlertStatus status;

    @Column(nullable = false, length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedByUser;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    protected FraudAlert() {
    }

    public FraudAlert(
            Transfer transfer,
            Account account,
            Customer customer,
            String ruleCode,
            FraudAlertSeverity severity,
            String description
    ) {
        this.transfer = transfer;
        this.account = account;
        this.customer = customer;
        this.ruleCode = ruleCode;
        this.severity = severity;
        this.description = description;
        this.status = FraudAlertStatus.OPEN;
    }

    public Transfer getTransfer() {
        return transfer;
    }

    public Account getAccount() {
        return account;
    }

    public Customer getCustomer() {
        return customer;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public FraudAlertSeverity getSeverity() {
        return severity;
    }

    public FraudAlertStatus getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public User getReviewedByUser() {
        return reviewedByUser;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void review(FraudAlertStatus status, User reviewer, Instant reviewedAt) {
        this.status = status;
        this.reviewedByUser = reviewer;
        this.reviewedAt = reviewedAt;
    }
}
