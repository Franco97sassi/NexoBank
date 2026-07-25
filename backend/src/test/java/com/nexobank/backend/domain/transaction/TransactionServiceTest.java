package com.nexobank.backend.domain.transaction;

import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.account.AccountType;
import com.nexobank.backend.domain.customer.Customer;
import com.nexobank.backend.domain.transaction.dto.MovementRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {
    @Mock TransactionRepository transactionRepository;
    @Mock AccountRepository accountRepository;
    private TransactionService service;
    private Account account;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        service = new TransactionService(transactionRepository, accountRepository);
        account = new Account((Customer) null, "2850590900000000000000", "test.account", "ARS", AccountType.SAVINGS);
        accountId = UUID.randomUUID();
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
    }

    @Test
    void depositUpdatesBalanceAndCreatesMovement() {
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.deposit(accountId, new MovementRequest(new BigDecimal("150.25"), "Cash deposit"));

        assertThat(account.getBalance()).isEqualByComparingTo("150.25");
        ArgumentCaptor<Transaction> movement = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(movement.capture());
        assertThat(movement.getValue().getType()).isEqualTo(TransactionType.DEPOSIT);
        assertThat(movement.getValue().getBalanceAfter()).isEqualByComparingTo("150.25");
    }

    @Test
    void withdrawalRejectsInsufficientFunds() {
        assertThatThrownBy(() -> service.withdraw(accountId,
                new MovementRequest(BigDecimal.ONE, "Cash withdrawal")))
                .isInstanceOf(TransactionConflictException.class)
                .hasMessage("Insufficient funds");
        assertThat(account.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
