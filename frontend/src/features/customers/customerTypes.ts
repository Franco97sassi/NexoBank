export type Customer = {
  id: string;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFormData = {
  userId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string | null;
  phone: string;
};

export type CustomerPage = {
  content: Customer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CustomerQuery = {
  search: string;
  page: number;
  size: number;
  sortBy: 'firstName' | 'lastName' | 'documentNumber' | 'birthDate';
  direction: 'ASC' | 'DESC';
};
