export interface Beneficiary { id:string; customerId:string; customerName:string; displayName:string; cbu:string; alias:string|null; bankName:string|null; active:boolean; internal:boolean; createdAt:string }
export interface BeneficiaryFormData { customerId:string; displayName:string; cbu:string; alias:string; bankName:string }
export interface BeneficiaryQuery { customerId:string; search:string; active:''|boolean; page:number; size:number; sortBy:'displayName'|'cbu'|'bankName'|'createdAt'; direction:'ASC'|'DESC' }
export interface BeneficiaryPage { content:Beneficiary[]; page:number; size:number; totalElements:number; totalPages:number }
