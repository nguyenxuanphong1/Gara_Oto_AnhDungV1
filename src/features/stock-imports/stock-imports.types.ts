export interface StockImport {
  id: string;
  import_code: string;
  item_id: string;
  warehouse_id: string | null;
  quantity: number;
  import_price: number;
  created_at: string;
}

export interface StockImportWithRelations
  extends StockImport {
  item: {
    id: string;
    code: string;
    name: string;
    item_type: "PART" | "SERVICE";
    unit: string;
  } | null;

  warehouse: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface StockImportFormData {
  item_id: string;
  warehouse_id: string | null;
  quantity: number;
  import_price: number;
}

export interface StockImportValidationErrors {
  item_id?: string;
  warehouse_id?: string;
  quantity?: string;
  import_price?: string;
}

export interface StockImportValidationResult {
  valid: boolean;
  errors: StockImportValidationErrors;
}