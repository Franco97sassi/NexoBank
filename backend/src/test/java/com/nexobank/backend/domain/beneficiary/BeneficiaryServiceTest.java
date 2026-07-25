package com.nexobank.backend.domain.beneficiary;

import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.beneficiary.dto.BeneficiaryRequest;
import com.nexobank.backend.domain.customer.Customer;
import com.nexobank.backend.domain.customer.CustomerRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeneficiaryServiceTest {
    @Mock BeneficiaryRepository beneficiaryRepository;
    @Mock CustomerRepository customerRepository;
    @Mock AccountRepository accountRepository;
    private BeneficiaryService service;
    private Customer customer;
    private UUID customerId;

    @BeforeEach void setUp() {
        service = new BeneficiaryService(beneficiaryRepository, customerRepository, accountRepository);
        customer = new Customer(null, "Ana", "Pérez", "12345678", null, null);
        customerId = UUID.randomUUID();
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
    }

    @Test void createNormalizesOptionalFieldsAndDetectsExternalAccount() {
        when(beneficiaryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(accountRepository.findByCbu("1234567890123456789012")).thenReturn(Optional.empty());
        var result = service.create(new BeneficiaryRequest(customerId, "  Proveedor  ",
                "1234567890123456789012", "", "  Banco Uno  "));
        assertThat(result.displayName()).isEqualTo("Proveedor");
        assertThat(result.bankName()).isEqualTo("Banco Uno");
        assertThat(result.alias()).isNull();
        assertThat(result.internal()).isFalse();
    }

    @Test void createRejectsDuplicateCbuForCustomer() {
        Beneficiary existing = new Beneficiary(customer, null, "Existente", "1234567890123456789012", null, null);
        when(beneficiaryRepository.findByCustomerIdAndCbu(customerId, "1234567890123456789012"))
                .thenReturn(Optional.of(existing));
        assertThatThrownBy(() -> service.create(new BeneficiaryRequest(customerId, "Duplicado",
                "1234567890123456789012", "", "")))
                .isInstanceOf(BeneficiaryConflictException.class)
                .hasMessage("CBU is already registered for this customer");
    }
}
