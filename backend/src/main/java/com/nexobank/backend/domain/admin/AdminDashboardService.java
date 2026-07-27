package com.nexobank.backend.domain.admin;

import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.account.AccountStatus;
import com.nexobank.backend.domain.admin.dto.AdminDashboardResponse;
import com.nexobank.backend.domain.customer.CustomerRepository;
import com.nexobank.backend.domain.transaction.TransactionRepository;
import com.nexobank.backend.domain.transfer.TransferRepository;
import com.nexobank.backend.domain.transfer.TransferStatus;
import com.nexobank.backend.domain.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {
    private final UserRepository users;
    private final CustomerRepository customers;
    private final AccountRepository accounts;
    private final TransferRepository transfers;
    private final TransactionRepository transactions;

    public AdminDashboardService(UserRepository users, CustomerRepository customers,
                                 AccountRepository accounts, TransferRepository transfers,
                                 TransactionRepository transactions) {
        this.users = users;
        this.customers = customers;
        this.accounts = accounts;
        this.transfers = transfers;
        this.transactions = transactions;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        var recentTransfers = transfers.findTop5ByOrderByCreatedAtDesc().stream()
                .map(transfer -> new AdminDashboardResponse.RecentTransfer(
                        transfer.getId(), transfer.getSourceAccount().getCbu(), transfer.getDestinationCbu(),
                        transfer.getAmount(), transfer.getCurrency(), transfer.getStatus().name(),
                        transfer.getCreatedAt()))
                .toList();

        return new AdminDashboardResponse(
                users.count(), customers.count(), accounts.count(),
                accounts.countByStatus(AccountStatus.ACTIVE), accounts.countByStatus(AccountStatus.BLOCKED),
                accounts.sumBalancesByStatus(AccountStatus.ACTIVE), transfers.count(),
                transfers.countByStatus(TransferStatus.COMPLETED),
                transfers.countByStatus(TransferStatus.REJECTED),
                transfers.sumAmountsByStatus(TransferStatus.COMPLETED),
                transactions.count(), recentTransfers);
    }
}
