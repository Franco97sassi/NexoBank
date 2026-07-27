package com.nexobank.backend.domain.transfer;

import com.nexobank.backend.domain.account.AccountRepository;
import com.nexobank.backend.domain.beneficiary.BeneficiaryRepository;
import com.nexobank.backend.domain.ledger.LedgerEntryRepository;
import com.nexobank.backend.domain.transaction.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {
    @Mock TransferRepository transferRepository;
    @Mock AccountRepository accountRepository;
    @Mock BeneficiaryRepository beneficiaryRepository;
    @Mock TransactionRepository transactionRepository;
    @Mock LedgerEntryRepository ledgerEntryRepository;
    @Mock Transfer transfer;

    private TransferService service;

    @BeforeEach
    void setUp() {
        service = new TransferService(transferRepository, accountRepository, beneficiaryRepository,
                transactionRepository, ledgerEntryRepository);
    }

    @Test
    void receiptRejectsTransferThatIsNotCompleted() {
        UUID transferId = UUID.randomUUID();
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(transfer));
        when(transfer.getStatus()).thenReturn(TransferStatus.PENDING);

        assertThatThrownBy(() -> service.getReceipt(transferId))
                .isInstanceOf(TransferConflictException.class)
                .hasMessage("A receipt is only available for completed transfers");
    }
}
