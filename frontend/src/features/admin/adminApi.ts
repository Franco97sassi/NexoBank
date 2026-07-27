import { httpClient } from '../../api/httpClient';
import type { AdminDashboard } from './adminTypes';

export async function getAdminDashboard() {
  const response = await httpClient.get<AdminDashboard>('/api/v1/admin/dashboard');
  return response.data;
}
