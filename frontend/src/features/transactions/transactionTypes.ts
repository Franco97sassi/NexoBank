export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export interface Transaction { id:string; accountId:string; accountAlias:string; type:TransactionType; amount:number; balanceAfter:number; referenceId:string|null; description:string; createdAt:string }
export interface TransactionPage { content:Transaction[]; page:number; size:number; totalElements:number; totalPages:number }
export interface TransactionQuery { accountId:string; type:''|TransactionType; from:string; to:string; page:number; size:number; sortBy:'type'|'amount'|'balanceAfter'|'createdAt'; direction:'ASC'|'DESC' }
export type OperationType = 'deposits'|'withdrawals'|'adjustments';
export interface OperationData { amount:number; description:string }
