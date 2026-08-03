import { httpClient } from '../../api/httpClient';
import type { LedgerEntry, LedgerEntryPage, LedgerQuery } from './ledgerTypes';

export async function getLedgerEntries(query: LedgerQuery): Promise<LedgerEntryPage> {
  return (
    await httpClient.get<LedgerEntryPage>('/api/v1/ledger', {
      params: {
        ...query,
        accountId: query.accountId || undefined,
        transferId: query.transferId || undefined,
      },
    })
  ).data;
}

export async function getLedgerJournal(journalId: string): Promise<LedgerEntry[]> {
  return (await httpClient.get<LedgerEntry[]>(`/api/v1/ledger/journals/${journalId}`))
    .data;
}
