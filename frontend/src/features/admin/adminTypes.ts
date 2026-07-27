export type RecentTransfer = {
  id: string;
  sourceCbu: string;
  destinationCbu: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
};

export type AdminDashboard = {
  users: number;
  customers: number;
  accounts: number;
  activeAccounts: number;
  blockedAccounts: number;
  totalActiveBalance: number;
  transfers: number;
  completedTransfers: number;
  rejectedTransfers: number;
  completedTransferVolume: number;
  transactions: number;
  recentTransfers: RecentTransfer[];
};
