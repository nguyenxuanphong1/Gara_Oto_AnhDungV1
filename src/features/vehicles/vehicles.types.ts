export interface Vehicle {
  id: string;
  license_plate: string;
  car_model: string;
  customer_id: string;
  created_at: string;
}

export interface VehicleWithCustomer extends Vehicle {
  customer: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

export interface VehicleFormData {
  license_plate: string;
  car_model: string;
  customer_id: string;
}

export interface VehicleValidationErrors {
  license_plate?: string;
  car_model?: string;
  customer_id?: string;
}

export interface VehicleValidationResult {
  valid: boolean;
  errors: VehicleValidationErrors;
}