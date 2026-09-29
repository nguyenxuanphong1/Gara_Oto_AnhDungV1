export type InventoryItemType = "PART" | "SERVICE";

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  item_type: InventoryItemType;
  unit: string;
  sell_price: number;
  stock_quantity: number;
  created_at: string;
}

export interface InventoryItemFormData {
  name: string;
  item_type: InventoryItemType;
  unit: string;
  sell_price: number;
}

export interface InventoryItemValidationErrors {
  name?: string;
  item_type?: string;
  unit?: string;
  sell_price?: string;
}

export interface InventoryItemValidationResult {
  valid: boolean;
  errors: InventoryItemValidationErrors;
}