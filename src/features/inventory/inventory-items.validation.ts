import type {
  InventoryItemFormData,
  InventoryItemValidationResult,
} from "./inventory-items.types";

export function validateInventoryItem(
  input: InventoryItemFormData,
): InventoryItemValidationResult {
  const errors: InventoryItemValidationResult["errors"] = {};

  const name = input.name.trim();
  const unit = input.unit.trim();
  const sellPrice = input.sell_price;

  if (!name) {
    errors.name = "Vui lòng nhập tên phụ tùng hoặc dịch vụ.";
  }

  if (
    input.item_type !== "PART" &&
    input.item_type !== "SERVICE"
  ) {
    errors.item_type = "Loại mặt hàng không hợp lệ.";
  }

  if (!unit) {
    errors.unit = "Vui lòng nhập đơn vị tính.";
  }

  if (
    typeof sellPrice !== "number" ||
    !Number.isFinite(sellPrice)
  ) {
    errors.sell_price = "Giá bán không hợp lệ.";
  } else if (sellPrice < 0) {
    errors.sell_price = "Giá bán không được nhỏ hơn 0.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}