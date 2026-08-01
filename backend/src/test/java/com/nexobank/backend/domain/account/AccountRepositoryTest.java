package com.nexobank.backend.domain.account;

import com.nexobank.backend.domain.customer.Customer;
import com.nexobank.backend.domain.customer.CustomerRepository;
import com.nexobank.backend.domain.user.Role;
import com.nexobank.backend.domain.user.User;
import com.nexobank.backend.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AccountRepositoryTest {
    @Autowired AccountRepository accounts;
    @Autowired CustomerRepository customers;
    @Autowired UserRepository users;

    @Test
    void findsAnAccountByItsCbu() {
        User user = users.save(new User("ada.lovelace@example.com", "password-hash", Role.CUSTOMER));
        Customer customer = customers.save(new Customer(user, "Ada", "Lovelace", "DOC-13", null, null));
        accounts.save(new Account(customer, "2850590900000000000013", "phase.thirteen", "ARS", AccountType.SAVINGS));

        assertThat(accounts.findByCbu("2850590900000000000013"))
                .get().extracting(Account::getAlias).isEqualTo("phase.thirteen");
    }
}
