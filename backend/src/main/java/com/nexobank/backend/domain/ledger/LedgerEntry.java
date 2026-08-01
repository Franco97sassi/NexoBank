package com.nexobank.backend.domain.ledger;

import com.nexobank.backend.common.model.BaseEntity;
import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.transaction.Transaction;
import com.nexobank.backend.domain.transfer.Transfer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "ledger_entries")
public class LedgerEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "journal_id", nullable = false)
    private UUID journalId;

    @Column(name = "account_code", nullable = false, length = 100)
    private String accountCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id")
    private Transfer transfer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 30)
    private LedgerEntryType entryType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "balance_after", precision = 19, scale = 2)
    private BigDecimal balanceAfter;

    @Column(length = 255)
    private String description;

    protected LedgerEntry() {
    }

    public LedgerEntry(
            UUID journalId,
            String accountCode,
            Account account,
            Transfer transfer,
            Transaction transaction,
            LedgerEntryType entryType,
            BigDecimal amount,
            String currency,
            BigDecimal balanceAfter,
            String description
    ) {
        this.journalId = journalId;
        this.accountCode = accountCode;
        this.account = account;
        this.transfer = transfer;
        this.transaction = transaction;
        this.entryType = entryType;
        this.amount = amount;
        this.currency = currency;
        this.balanceAfter = balanceAfter;
        this.description = description;
    }

    public UUID getJournalId() {
        return journalId;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public Account getAccount() {
        return account;
    }

    public Transfer getTransfer() {
        return transfer;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public LedgerEntryType getEntryType() {
        return entryType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public String getDescription() {
        return description;
    }
}
