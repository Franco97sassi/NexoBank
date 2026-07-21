
package com.nexobank.backend.domain.beneficiary;

import com.nexobank.backend.common.model.BaseEntity;
import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.customer.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "beneficiaries")
public class Beneficiary extends BaseEntity {

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "customer_id", nullable = false)
private Customer customer;



@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "destination_account_id")
private Account destinationAccount;


@Column(name = "display_name", nullable = false, length = 120)
private String displayName;

@Column(nullable = false, length = 22)
private String cbu;

@Column(length = 30)
private String alias;

@Column(name = "bank_name", length = 120)
private String bankName;

@Column(nullable = false)
private boolean active = true;

protected Beneficiary() {
}

public Beneficiary(
        Customer customer,
        Account destinationAccount,
        String displayName,
        String cbu,
        String alias,
        String bankName
) {
    this.customer = customer;
    this.destinationAccount = destinationAccount;
    this.displayName = displayName;
    this.cbu = cbu;
    this.alias = alias;
    this.bankName = bankName;
    this.active = true;
}

public Customer getCustomer() {
    return customer;
}

public Account getDestinationAccount() {
    return destinationAccount;
}

public String getDisplayName() {
    return displayName;
}

public String getCbu() {
    return cbu;
}

public String getAlias() {
    return alias;
}

public String getBankName() {
    return bankName;
}

public boolean isActive() {
    return active;
}
}