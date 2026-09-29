export interface Warehouse {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface WarehouseFormData {
  name: string;
}

export interface WarehouseValidationErrors {
  name?: string;
}

export interface WarehouseValidationResult {
  valid: boolean;
  errors: WarehouseValidationErrors;
}