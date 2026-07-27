export type AuditEvent = {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  eventType: string;
  entityType: string;
  entityId: string | null;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AuditEventPage = {
  content: AuditEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AuditQuery = {
  eventType: string;
  entityType: string;
  from: string;
  to: string;
  page: number;
  size: number;
};
