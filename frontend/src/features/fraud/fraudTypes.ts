export type FraudAlertStatus = 'OPEN' | 'UNDER_REVIEW' | 'DISMISSED' | 'CONFIRMED';
export type FraudAlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface FraudAlert {
  id: string;
  transferId: string | null;
  accountId: string | null;
  customerId: string | null;
  ruleCode: string;
  severity: FraudAlertSeverity;
  status: FraudAlertStatus;
  description: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
export interface FraudAlertPage {
  content: FraudAlert[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
