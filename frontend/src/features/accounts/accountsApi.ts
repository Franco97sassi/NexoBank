import { httpClient } from '../../api/httpClient';
import type {
  Account,
  AccountPage,
  AccountQuery,
  CreateAccountData,
  UpdateAccountData,
} from './accountTypes';

export async function getAccounts(query: AccountQuery): Promise<AccountPage> {
  return (await httpClient.get<AccountPage>('/api/v1/accounts', { params: query })).data;
}

export async function createAccount(data: CreateAccountData): Promise<Account> {
  return (await httpClient.post<Account>('/api/v1/accounts', data)).data;
}

export async function updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
  return (await httpClient.put<Account>(`/api/v1/accounts/${id}`, data)).data;
}
