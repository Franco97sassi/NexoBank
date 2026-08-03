import { httpClient } from '../../api/httpClient';
import type {
  Customer,
  CustomerFormData,
  CustomerPage,
  CustomerQuery,
} from './customerTypes';

export async function getCustomers(query: CustomerQuery): Promise<CustomerPage> {
  return (await httpClient.get<CustomerPage>('/api/v1/customers', { params: query }))
    .data;
}
export async function getCustomer(id: string): Promise<Customer> {
  return (await httpClient.get<Customer>(`/api/v1/customers/${id}`)).data;
}
export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  return (await httpClient.post<Customer>('/api/v1/customers', data)).data;
}
export async function updateCustomer(
  id: string,
  data: CustomerFormData,
): Promise<Customer> {
  return (await httpClient.put<Customer>(`/api/v1/customers/${id}`, data)).data;
}
export async function deleteCustomer(id: string): Promise<void> {
  await httpClient.delete(`/api/v1/customers/${id}`);
}
