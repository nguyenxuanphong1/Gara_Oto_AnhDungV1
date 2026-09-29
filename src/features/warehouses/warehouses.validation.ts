import type {
  WarehouseFormData,
  WarehouseValidationResult,
} from "./warehouses.types";

export function validateWarehouse(
  input: WarehouseFormData,
): WarehouseValidationResult {
  const errors: WarehouseValidationResult["errors"] = {};

  const name = input.name.trim();

  if (!name) {
    errors.name = "Vui lòng nhập tên kho.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}