export type TransferStatus =
  'PENDING' | 'COMPLETED' | 'REJECTED' | 'FAILED' | 'CANCELLED';

export type Transfer = {
  id: string;
  sourceAccountId: string;
  sourceCbu: string;
  beneficiaryId: string;
  beneficiaryName: string;
  destinationCbu: string;
  destinationAlias: string | null;
  amount: number;
  currency: string;
  status: TransferStatus;
  idempotencyKey: string;
  description: string;
  failureReason: string | null;
  executedAt: string | null;
  createdAt: string;
};

export type TransferPage = {
  content: Transfer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type TransferQuery = {
  accountId: string;
  status: '' | TransferStatus;
  page: number;
  size: number;
  sortBy: 'amount' | 'status' | 'executedAt' | 'createdAt';
  direction: 'ASC' | 'DESC';
};

export type CreateTransferData = {
  sourceAccountId: string;
  beneficiaryId: string;
  amount: number;
  idempotencyKey: string;
  description: string;
};

export type TransferReceipt = {
  receiptNumber: string;
  transferId: string;
  issuedAt: string;
  executedAt: string;
  sourceHolder: string;
  sourceDocument: string;
  sourceCbu: string;
  destinationHolder: string;
  destinationCbu: string;
  destinationAlias: string | null;
  amount: number;
  currency: string;
  description: string | null;
};
