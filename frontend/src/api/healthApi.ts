import { httpClient } from './httpClient';

export type HealthResponse = {
  application: string;
  status: string;
  database: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await httpClient.get<HealthResponse>('/api/health');
  return response.data;
}
