package com.nexobank.backend.domain.account;

import com.nexobank.backend.common.model.BaseEntity;
import com.nexobank.backend.domain.customer.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
public class Account extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, unique = true, length = 22)
    private String cbu;

    @Column(nullable = false, unique = true, length = 30)
    private String alias;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 30)
    private AccountType accountType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountStatus status;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Version
    @Column(nullable = false)
    private Long version;

    protected Account() {
    }

    public Account(
            Customer customer,
            String cbu,
            String alias,
            String currency,
            AccountType accountType
    ) {
        this.customer = customer;
        this.cbu = cbu;
        this.alias = alias;
        this.currency = currency;
        this.accountType = accountType;
        this.status = AccountStatus.ACTIVE;
        this.balance = BigDecimal.ZERO;
    }

    public Customer getCustomer() {
        return customer;
    }

    public String getCbu() {
        return cbu;
    }

    public String getAlias() {
        return alias;
    }

    public String getCurrency() {
        return currency;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public Long getVersion() {
        return version;
    }
}