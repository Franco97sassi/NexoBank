export type LedgerEntryType = 'DEBIT' | 'CREDIT';

export type LedgerEntry = {
  id: string;
  journalId: string;
  accountCode: string;
  accountId: string | null;
  transferId: string | null;
  transactionId: string | null;
  entryType: LedgerEntryType;
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

export type LedgerEntryPage = {
  content: LedgerEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LedgerQuery = {
  accountId: string;
  transferId: string;
  page: number;
  size: number;
};
