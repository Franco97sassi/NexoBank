import { httpClient } from '../../api/httpClient';
import type { FraudAlertPage, FraudAlertSeverity, FraudAlertStatus } from './fraudTypes';

export async function getFraudAlerts(
  status: string,
  severity: string,
  page: number,
  size: number,
) {
  return (
    await httpClient.get<FraudAlertPage>('/api/v1/fraud-alerts', {
      params: {
        status: status || undefined,
        severity: severity || undefined,
        page,
        size,
      },
    })
  ).data;
}
export async function reviewFraudAlert(id: string, status: FraudAlertStatus) {
  return (await httpClient.patch(`/api/v1/fraud-alerts/${id}/status`, { status })).data;
}
export type { FraudAlertSeverity };
