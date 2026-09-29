import type {
  RepairOrderDetailFormData,
  RepairOrderDetailValidationResult,
  RepairOrderFormData,
  RepairOrderValidationResult,
} from "./repair-orders.types";

const VALID_STATUSES = [
  "DRAFT",
  "COMPLETED",
  "CANCELLED",
] as const;

export function validateRepairOrderDetail(
  input: RepairOrderDetailFormData,
): RepairOrderDetailValidationResult {
  const errors: RepairOrderDetailValidationResult["errors"] =
    {};

  const itemId = input.item_id.trim();

  if (!itemId) {
    errors.item_id = "Vui lòng chọn vật tư hoặc dịch vụ.";
  }

  if (
    typeof input.quantity !== "number" ||
    !Number.isInteger(input.quantity)
  ) {
    errors.quantity = "Số lượng phải là số nguyên.";
  } else if (input.quantity <= 0) {
    errors.quantity =
      "Số lượng phải lớn hơn 0.";
  }

  if (
    typeof input.price !== "number" ||
    !Number.isFinite(input.price)
  ) {
    errors.price = "Đơn giá không hợp lệ.";
  } else if (input.price < 0) {
    errors.price =
      "Đơn giá không được nhỏ hơn 0.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRepairOrder(
  input: RepairOrderFormData,
  details: RepairOrderDetailFormData[],
): RepairOrderValidationResult {
  const errors: RepairOrderValidationResult["errors"] =
    {};

  const vehicleId = input.vehicle_id.trim();

  if (!vehicleId) {
    errors.vehicle_id = "Vui lòng chọn xe.";
  }

  if (
    input.warehouse_id !== null &&
    typeof input.warehouse_id !== "string"
  ) {
    errors.warehouse_id = "Kho không hợp lệ.";
  }

  if (
    typeof input.odometer_km !== "number" ||
    !Number.isInteger(input.odometer_km)
  ) {
    errors.odometer_km =
      "Số km phải là số nguyên.";
  } else if (input.odometer_km < 0) {
    errors.odometer_km =
      "Số km không được nhỏ hơn 0.";
  }

  if (
    typeof input.labor_cost !== "number" ||
    !Number.isFinite(input.labor_cost)
  ) {
    errors.labor_cost =
      "Chi phí công không hợp lệ.";
  } else if (input.labor_cost < 0) {
    errors.labor_cost =
      "Chi phí công không được nhỏ hơn 0.";
  }

  if (
    typeof input.discount !== "number" ||
    !Number.isFinite(input.discount)
  ) {
    errors.discount =
      "Giảm giá không hợp lệ.";
  } else if (input.discount < 0) {
    errors.discount =
      "Giảm giá không được nhỏ hơn 0.";
  }

  if (
    !VALID_STATUSES.includes(
      input.status,
    )
  ) {
    errors.status =
      "Trạng thái phiếu không hợp lệ.";
  }

  if (details.length === 0) {
    errors.details =
      "Phiếu sửa chữa phải có ít nhất một vật tư hoặc dịch vụ.";
  } else {
    for (const detail of details) {
      const result =
        validateRepairOrderDetail(
          detail,
        );

      if (!result.valid) {
        errors.details =
          "Chi tiết phiếu sửa chữa chưa hợp lệ.";
        break;
      }
    }

    const itemIds = details.map(
      (detail) => detail.item_id.trim(),
    );

    const hasDuplicateItem =
      new Set(itemIds).size !==
      itemIds.length;

    if (hasDuplicateItem) {
      errors.details =
        "Không được thêm trùng cùng một vật tư hoặc dịch vụ trong phiếu.";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}