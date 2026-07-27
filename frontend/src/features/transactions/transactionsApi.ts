import { httpClient } from '../../api/httpClient';
import type {
  OperationData,
  OperationType,
  TransactionPage,
  TransactionQuery,
} from './transactionTypes';
export async function getTransactions(query: TransactionQuery) {
  const params = {
    ...query,
    accountId: query.accountId || undefined,
    type: query.type || undefined,
    from: query.from ? new Date(`${query.from}T00:00:00`).toISOString() : undefined,
    to: query.to ? new Date(`${query.to}T23:59:59.999`).toISOString() : undefined,
  };
  return (await httpClient.get<TransactionPage>('/api/v1/transactions', { params })).data;
}
export async function createOperation(
  accountId: string,
  operation: OperationType,
  data: OperationData,
) {
  return (
    await httpClient.post(`/api/v1/transactions/accounts/${accountId}/${operation}`, data)
  ).data;
}
