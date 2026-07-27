import { httpClient } from '../../api/httpClient';
import type {
  CreateTransferData,
  Transfer,
  TransferPage,
  TransferQuery,
  TransferReceipt,
} from './transferTypes';

export async function getTransfers(query: TransferQuery) {
  const params = {
    ...query,
    accountId: query.accountId || undefined,
    status: query.status || undefined,
  };
  return (await httpClient.get<TransferPage>('/api/v1/transfers', { params })).data;
}

export async function createTransfer(data: CreateTransferData) {
  return (await httpClient.post<Transfer>('/api/v1/transfers', data)).data;
}

export async function getTransferReceipt(transferId: string) {
  return (
    await httpClient.get<TransferReceipt>(`/api/v1/transfers/${transferId}/receipt`)
  ).data;
}
