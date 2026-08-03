import { httpClient } from '../../api/httpClient';
import type {
  Beneficiary,
  BeneficiaryFormData,
  BeneficiaryPage,
  BeneficiaryQuery,
} from './beneficiaryTypes';
export async function getBeneficiaries(query: BeneficiaryQuery) {
  const params = {
    ...query,
    customerId: query.customerId || undefined,
    search: query.search || undefined,
    active: query.active === '' ? undefined : query.active,
  };
  return (await httpClient.get<BeneficiaryPage>('/api/v1/beneficiaries', { params }))
    .data;
}
export async function getBeneficiary(id: string) {
  return (await httpClient.get<Beneficiary>(`/api/v1/beneficiaries/${id}`)).data;
}
export async function createBeneficiary(data: BeneficiaryFormData) {
  return (await httpClient.post<Beneficiary>('/api/v1/beneficiaries', data)).data;
}
export async function updateBeneficiary(id: string, data: BeneficiaryFormData) {
  return (await httpClient.put<Beneficiary>(`/api/v1/beneficiaries/${id}`, data)).data;
}
export async function deactivateBeneficiary(id: string) {
  await httpClient.delete(`/api/v1/beneficiaries/${id}`);
}
