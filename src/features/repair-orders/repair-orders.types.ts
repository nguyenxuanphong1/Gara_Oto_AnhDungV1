export type RepairOrderStatus =
  | "DRAFT"
  | "COMPLETED"
  | "CANCELLED";

export interface RepairOrder {
  id: string;
  order_code: string;
  vehicle_id: string;
  warehouse_id: string | null;
  odometer_km: number;
  labor_cost: number;
  discount: number;
  total_amount: number;
  status: RepairOrderStatus;
  created_at: string;
}

export interface RepairOrderDetail {
  id: string;
  repair_order_id: string;
  item_id: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface RepairOrderDetailWithItem
  extends RepairOrderDetail {
  item: {
    id: string;
    code: string;
    name: string;
    item_type: "PART" | "SERVICE";
    unit: string;
  } | null;
}

export interface RepairOrderWithRelations
  extends RepairOrder {
  vehicle: {
    id: string;
    license_plate: string;
    car_model: string;
    customer_id: string;
    customer: {
      id: string;
      name: string;
      phone: string;
    } | null;
  } | null;

  warehouse: {
    id: string;
    code: string;
    name: string;
  } | null;

  details: RepairOrderDetailWithItem[];
}

export interface RepairOrderFormData {
  vehicle_id: string;
  warehouse_id: string | null;
  odometer_km: number;
  labor_cost: number;
  discount: number;
  status: RepairOrderStatus;
}

export interface RepairOrderDetailFormData {
  item_id: string;
  quantity: number;
  price: number;
}

export interface RepairOrderFormState
  extends RepairOrderFormData {
  details: RepairOrderDetailFormData[];
}

export interface RepairOrderValidationErrors {
  vehicle_id?: string;
  warehouse_id?: string;
  odometer_km?: string;
  labor_cost?: string;
  discount?: string;
  status?: string;
  details?: string;
}

export interface RepairOrderDetailValidationErrors {
  item_id?: string;
  quantity?: string;
  price?: string;
}

export interface RepairOrderValidationResult {
  valid: boolean;
  errors: RepairOrderValidationErrors;
}

export interface RepairOrderDetailValidationResult {
  valid: boolean;
  errors: RepairOrderDetailValidationErrors;
}