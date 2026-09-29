import type {
  StockImportFormData,
  StockImportValidationResult,
} from "./stock-imports.types";

export function validateStockImport(
  input: StockImportFormData,
): StockImportValidationResult {
  const errors: StockImportValidationResult["errors"] =
    {};

  const itemId = input.item_id.trim();
  const warehouseId =
    input.warehouse_id?.trim() ?? "";

  const quantity = input.quantity;
  const importPrice = input.import_price;

  /*
   * item_id
   * SQL: NOT NULL + FOREIGN KEY -> inventory_items.id
   */
  if (!itemId) {
    errors.item_id =
      "Vui lòng chọn mặt hàng.";
  }

  /*
   * warehouse_id
   * SQL: nullable
   *
   * Vì database cho phép NULL nên
   * không bắt buộc phải chọn kho.
   */
  if (warehouseId === "") {
    // Không báo lỗi.
  }

  /*
   * quantity
   * SQL:
   * NOT NULL
   * CHECK (quantity > 0)
   */
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity)
  ) {
    errors.quantity =
      "Số lượng nhập phải là số nguyên.";
  } else if (quantity <= 0) {
    errors.quantity =
      "Số lượng nhập phải lớn hơn 0.";
  }

  /*
   * import_price
   * SQL:
   * NOT NULL
   * CHECK (import_price >= 0)
   */
  if (
    typeof importPrice !== "number" ||
    !Number.isFinite(importPrice)
  ) {
    errors.import_price =
      "Giá nhập không hợp lệ.";
  } else if (importPrice < 0) {
    errors.import_price =
      "Giá nhập không được nhỏ hơn 0.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}