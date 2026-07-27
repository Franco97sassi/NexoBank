package com.nexobank.backend.domain.account;

import com.nexobank.backend.domain.customer.Customer;
import com.nexobank.backend.domain.customer.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AccountRepositoryTest {
    @Autowired AccountRepository accounts;
    @Autowired CustomerRepository customers;

    @Test
    void findsAnAccountByItsCbu() {
        Customer customer = customers.save(new Customer(null, "Ada", "Lovelace", "DOC-13", null, null));
        accounts.save(new Account(customer, "2850590900000000000013", "phase.thirteen", "ARS", AccountType.SAVINGS));

        assertThat(accounts.findByCbu("2850590900000000000013"))
                .get().extracting(Account::getAlias).isEqualTo("phase.thirteen");
    }
}
