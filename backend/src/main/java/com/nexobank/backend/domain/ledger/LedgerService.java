package com.nexobank.backend.domain.ledger;

import com.nexobank.backend.domain.account.Account;
import com.nexobank.backend.domain.transaction.Transaction;
import com.nexobank.backend.domain.transfer.Transfer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.nexobank.backend.domain.ledger.dto.LedgerEntryPageResponse;
import com.nexobank.backend.domain.ledger.dto.LedgerEntryResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class LedgerService {
    static final String CASH_ACCOUNT = "SYSTEM:CASH";
    static final String EXTERNAL_SETTLEMENT_ACCOUNT = "SYSTEM:EXTERNAL_SETTLEMENT";

    private final LedgerEntryRepository entries;

    public LedgerService(LedgerEntryRepository entries) {
        this.entries = entries;
    }

    @Transactional(readOnly = true)
    public LedgerEntryPageResponse findAll(UUID accountId, UUID transferId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = accountId != null ? entries.findAllByAccountId(accountId, pageable)
                : transferId != null ? entries.findAllByTransferId(transferId, pageable)
                : entries.findAll(pageable);
        return LedgerEntryPageResponse.from(result.map(LedgerEntryResponse::from));
    }

    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> findJournal(UUID journalId) {
        return entries.findAllByJournalIdOrderByCreatedAtAsc(journalId).stream()
                .map(LedgerEntryResponse::from).toList();
    }

    public void recordMovement(Account account, Transaction transaction, LedgerEntryType customerType,
                               BigDecimal amount, BigDecimal balanceAfter, String description) {
        UUID journalId = UUID.randomUUID();
        LedgerEntry customer = entry(journalId, customerCode(account), account, null, transaction, customerType,
                amount, account.getCurrency(), balanceAfter, description);
        LedgerEntry counter = entry(journalId, CASH_ACCOUNT, null, null, transaction, opposite(customerType),
                amount, account.getCurrency(), null, description);
        saveBalanced(List.of(customer, counter));
    }

    public void recordTransfer(Account source, Account destination, Transfer transfer, BigDecimal amount,
                               BigDecimal sourceBalance, BigDecimal destinationBalance, String description) {
        UUID journalId = UUID.randomUUID();
        LedgerEntry debit = entry(journalId, customerCode(source), source, transfer, null, LedgerEntryType.DEBIT,
                amount, source.getCurrency(), sourceBalance, description);
        LedgerEntry credit = destination == null
                ? entry(journalId, EXTERNAL_SETTLEMENT_ACCOUNT, null, transfer, null, LedgerEntryType.CREDIT,
                        amount, source.getCurrency(), null, description)
                : entry(journalId, customerCode(destination), destination, transfer, null, LedgerEntryType.CREDIT,
                        amount, destination.getCurrency(), destinationBalance, description);
        saveBalanced(List.of(debit, credit));
    }

    void saveBalanced(List<LedgerEntry> journal) {
        if (journal.size() < 2) throw new LedgerConflictException("A journal requires at least two entries");
        UUID journalId = journal.getFirst().getJournalId();
        String currency = journal.getFirst().getCurrency();
        BigDecimal debits = BigDecimal.ZERO;
        BigDecimal credits = BigDecimal.ZERO;
        for (LedgerEntry entry : journal) {
            if (!journalId.equals(entry.getJournalId()) || !currency.equals(entry.getCurrency()))
                throw new LedgerConflictException("All journal entries must share journal and currency");
            if (entry.getAmount() == null || entry.getAmount().signum() <= 0)
                throw new LedgerConflictException("Ledger amounts must be positive");
            if (entry.getEntryType() == LedgerEntryType.DEBIT) debits = debits.add(entry.getAmount());
            else credits = credits.add(entry.getAmount());
        }
        if (debits.compareTo(credits) != 0) throw new LedgerConflictException("Journal is not balanced");
        entries.saveAll(journal);
    }

    private LedgerEntry entry(UUID journalId, String code, Account account, Transfer transfer,
                              Transaction transaction, LedgerEntryType type, BigDecimal amount,
                              String currency, BigDecimal balanceAfter, String description) {
        return new LedgerEntry(journalId, code, account, transfer, transaction, type, amount,
                currency, balanceAfter, description);
    }

    private String customerCode(Account account) {
        return "CUSTOMER:" + account.getId();
    }

    private LedgerEntryType opposite(LedgerEntryType type) {
        return type == LedgerEntryType.DEBIT ? LedgerEntryType.CREDIT : LedgerEntryType.DEBIT;
    }
}
