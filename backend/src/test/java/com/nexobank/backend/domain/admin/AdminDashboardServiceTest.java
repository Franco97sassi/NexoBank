package com.nexobank.backend.domain.admin;

import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.account.AccountStatus;
import com.nexobank.backend.domain.customer.CustomerRepository;
import com.nexobank.backend.domain.transaction.TransactionRepository;
import com.nexobank.backend.domain.transfer.TransferRepository;
import com.nexobank.backend.domain.transfer.TransferStatus;
import com.nexobank.backend.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {
    @Mock UserRepository users;
    @Mock CustomerRepository customers;
    @Mock AccountRepository accounts;
    @Mock TransferRepository transfers;
    @Mock TransactionRepository transactions;
    @InjectMocks AdminDashboardService service;

    @Test
    void aggregatesAdministrativeIndicators() {
        when(users.count()).thenReturn(12L);
        when(customers.count()).thenReturn(9L);
        when(accounts.count()).thenReturn(11L);
        when(accounts.countByStatus(AccountStatus.ACTIVE)).thenReturn(8L);
        when(accounts.countByStatus(AccountStatus.BLOCKED)).thenReturn(2L);
        when(accounts.sumBalancesByStatus(AccountStatus.ACTIVE)).thenReturn(new BigDecimal("125000.50"));
        when(transfers.count()).thenReturn(20L);
        when(transfers.countByStatus(TransferStatus.COMPLETED)).thenReturn(17L);
        when(transfers.countByStatus(TransferStatus.REJECTED)).thenReturn(2L);
        when(transfers.sumAmountsByStatus(TransferStatus.COMPLETED)).thenReturn(new BigDecimal("80000.00"));
        when(transfers.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(transactions.count()).thenReturn(36L);

        var dashboard = service.getDashboard();

        assertThat(dashboard.users()).isEqualTo(12);
        assertThat(dashboard.activeAccounts()).isEqualTo(8);
        assertThat(dashboard.totalActiveBalance()).isEqualByComparingTo("125000.50");
        assertThat(dashboard.completedTransfers()).isEqualTo(17);
        assertThat(dashboard.completedTransferVolume()).isEqualByComparingTo("80000.00");
        assertThat(dashboard.recentTransfers()).isEmpty();
    }
}
