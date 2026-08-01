package com.nexobank.backend.domain.ledger;

import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.account.AccountType;
import com.nexobank.backend.domain.customer.Customer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {
    @Mock LedgerEntryRepository repository;

    @Test
    void movementCreatesBalancedCustomerAndCashEntries() {
        LedgerService service = new LedgerService(repository);
        Account account = new Account((Customer) null, "2850590900000000000000", "ledger.test", "ARS",
                AccountType.SAVINGS);

        service.recordMovement(account, null, LedgerEntryType.CREDIT, new BigDecimal("125.50"),
                new BigDecimal("125.50"), "Deposit");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<LedgerEntry>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        List<LedgerEntry> journal = captor.getValue();
        assertThat(journal).hasSize(2);
        assertThat(journal).extracting(LedgerEntry::getJournalId).containsOnly(journal.getFirst().getJournalId());
        assertThat(journal).extracting(LedgerEntry::getEntryType)
                .containsExactly(LedgerEntryType.CREDIT, LedgerEntryType.DEBIT);
        assertThat(journal).extracting(LedgerEntry::getAmount)
                .containsOnly(new BigDecimal("125.50"));
        assertThat(journal.get(1).getAccountCode()).isEqualTo(LedgerService.CASH_ACCOUNT);
    }
}
