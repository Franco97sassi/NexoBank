package com.nexobank.backend.domain.customer;

import com.nexobank.backend.domain.customer.dto.CustomerRequest;
import com.nexobank.backend.domain.user.Role;
import com.nexobank.backend.domain.user.User;
import com.nexobank.backend.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomerServiceTests {
    private CustomerRepository customerRepository;
    private UserRepository userRepository;
    private CustomerService service;

    @BeforeEach
    void setUp() {
        customerRepository = mock(CustomerRepository.class);
        userRepository = mock(UserRepository.class);
        service = new CustomerService(customerRepository, userRepository);
    }

    @Test
    void createsCustomerAndNormalizesInput() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId))
                .thenReturn(Optional.of(new User("customer@nexobank.test", "hash", Role.CUSTOMER)));
        when(customerRepository.findByDocumentNumber("ABC-12345")).thenReturn(Optional.empty());
        when(customerRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.create(new CustomerRequest(userId, " Ana ", " Pérez ", " abc-12345 ",
                LocalDate.of(1990, 1, 2), " +54 11 5555-5555 "));

        assertThat(result.firstName()).isEqualTo("Ana");
        assertThat(result.lastName()).isEqualTo("Pérez");
        assertThat(result.documentNumber()).isEqualTo("ABC-12345");
        assertThat(result.phone()).isEqualTo("+54 11 5555-5555");
        assertThat(result.userEmail()).isEqualTo("customer@nexobank.test");
    }

    @Test
    void rejectsUsersWithoutCustomerRole() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId))
                .thenReturn(Optional.of(new User("admin@nexobank.test", "hash", Role.ADMIN)));
        CustomerRequest request = new CustomerRequest(userId, "Ana", "Pérez", "ABC-12345", null, null);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(CustomerConflictException.class)
                .hasMessage("User must have CUSTOMER role");
    }
}
