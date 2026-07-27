import { httpClient } from '../../api/httpClient';
import type { AuditEventPage, AuditQuery } from './auditTypes';

export async function getAuditEvents(query: AuditQuery) {
  const params = {
    eventType: query.eventType || undefined,
    entityType: query.entityType || undefined,
    from: query.from ? new Date(query.from).toISOString() : undefined,
    to: query.to ? new Date(query.to).toISOString() : undefined,
    page: query.page,
    size: query.size,
  };
  return (await httpClient.get<AuditEventPage>('/api/v1/audit-events', { params })).data;
}
