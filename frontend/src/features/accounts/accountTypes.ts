export type AccountType = 'SAVINGS' | 'CHECKING';
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'CLOSED';
export type Currency = 'ARS' | 'USD';

export type Account = {
  id: string;
  customerId: string;
  customerName: string;
  customerDocument: string;
  cbu: string;
  alias: string;
  currency: Currency;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type AccountPage = {
  content: Account[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AccountQuery = {
  search: string;
  page: number;
  size: number;
  sortBy:
    'cbu' | 'alias' | 'currency' | 'accountType' | 'status' | 'balance' | 'createdAt';
  direction: 'ASC' | 'DESC';
};

export type CreateAccountData = {
  customerId: string;
  accountType: AccountType;
  currency: Currency;
  alias?: string;
};

export type UpdateAccountData = {
  alias: string;
  status: AccountStatus;
};
