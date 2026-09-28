export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  created_at: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
}

export interface CustomerValidationErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export interface CustomerValidationResult {
  valid: boolean;
  errors: CustomerValidationErrors;
}